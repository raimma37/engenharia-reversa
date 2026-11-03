import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Message from "../models/Message";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import ContactTag from "../models/ContactTag";
import QueueIntegrations from "../models/QueueIntegrations";
import CompaniesSettings from "../models/CompaniesSettings";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getWbot } from "../libs/wbot";
import { getIO } from "../libs/socket";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SendWhatsAppMedia, { getMessageOptions } from "../services/WbotServices/SendWhatsAppMedia";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import { handleIntegrationTransfer } from "../services/IntegrationServices/IntegrationActionsService";
import logger from "../utils/logger";
import { Pool } from "pg";

const TAG_COLORS: Record<string, string> = {
  "Atendimento Humano": "#DC2626",
  "Impressões Comuns": "#2563EB",
  "Orçamentos": "#D97706",
  "Orçamento Enviado": "#0284C7",
  "Orçamento Aprovado": "#16A34A"
};

export async function applyTriageTagToTicket(
  ticket: Ticket,
  tagName: string
): Promise<Tag | null> {
  if (!ticket || !tagName) return null;
  try {
    const cleanName = String(tagName).trim();
    const color = TAG_COLORS[cleanName] || "#64748B";
    const [tag] = await Tag.findOrCreate({
      where: { name: cleanName, companyId: ticket.companyId },
      defaults: {
        name: cleanName,
        color,
        kanban: 1,
        companyId: ticket.companyId
      }
    });

    await TicketTag.findOrCreate({
      where: { ticketId: ticket.id, tagId: tag.id },
      defaults: { ticketId: ticket.id, tagId: tag.id }
    });

    if (ticket.contactId) {
      await ContactTag.findOrCreate({
        where: { contactId: ticket.contactId, tagId: tag.id },
        defaults: { contactId: ticket.contactId, tagId: tag.id }
      });
    }

    try {
      const updatedTicket = await ShowTicketService(ticket.id, ticket.companyId);
      const io = getIO();
      io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });
    } catch (_) {}

    logger.info(`[TRIAGEM TAG] Etiqueta "${cleanName}" vinculada ao ticket #${ticket.id}`);
    return tag;
  } catch (err: any) {
    logger.error(`[TRIAGEM TAG] Erro ao aplicar etiqueta "${tagName}": ${err.message}`);
    return null;
  }
}

const BUDGET_DB_URL =
  process.env.BUDGET_SYSTEM_DATABASE_URL ||
  "postgresql://neondb_owner:npg_Vn1eFf3PBrpb@ep-snowy-river-ajl3bq8w.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";

let budgetPool: Pool | null = null;
function getBudgetPool(): Pool {
  if (!budgetPool) {
    budgetPool = new Pool({ connectionString: BUDGET_DB_URL });
  }
  return budgetPool;
}

export async function registerOrcamentoSolicitacao(data: {
  clientName: string;
  clientPhone: string;
  servico: string;
  arteStatus?: string;
  quantidade?: string;
  tamanho?: string;
  detalhes?: string;
  ticketId?: number;
}): Promise<void> {
  try {
    const pool = getBudgetPool();
    const cleanPhone = String(data.clientPhone || "").replace(/\D/g, "");
    const clientName = String(data.clientName || cleanPhone || "Cliente WhatsApp").trim();
    const servico = String(data.servico || "Orçamento sob medida").trim();

    // Evita duplicação caso o n8n e o backend registrem nos últimos 45s
    const dup = await pool.query(
      `SELECT id FROM orcamento_solicitacoes WHERE client_phone = $1 AND created_at > NOW() - INTERVAL '45 seconds' LIMIT 1`,
      [cleanPhone]
    );
    if (dup.rows.length > 0) return;

    // Localiza ou cria cliente na tabela clients do budget-system
    let clientId: number | null = null;
    if (cleanPhone.length >= 8) {
      const suffix = cleanPhone.slice(-8);
      const existing = await pool.query(
        `SELECT id FROM clients WHERE phone LIKE $1 LIMIT 1`,
        [`%${suffix}%`]
      );
      if (existing.rows.length > 0) {
        clientId = existing.rows[0].id;
      } else {
        const created = await pool.query(
          `INSERT INTO clients (name, phone, active, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW()) RETURNING id`,
          [clientName, cleanPhone]
        );
        if (created.rows.length > 0) clientId = created.rows[0].id;
      }
    }

    await pool.query(
      `INSERT INTO orcamento_solicitacoes
        (client_name, client_phone, client_id, servico, arte_status, quantidade, tamanho, detalhes, ticket_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pendente', NOW(), NOW())`,
      [
        clientName,
        cleanPhone,
        clientId,
        servico,
        String(data.arteStatus || ""),
        String(data.quantidade || ""),
        String(data.tamanho || ""),
        String(data.detalhes || ""),
        data.ticketId || null
      ]
    );
    logger.info(`[BUDGET-SYSTEM] Solicitação de orçamento registrada no Painel de Avisos para ${clientName} (${cleanPhone})`);
  } catch (err: any) {
    logger.error(`[BUDGET-SYSTEM] Erro ao registrar solicitação de orçamento: ${err.message}`);
  }
}

/**
 * Resolve a conexão WhatsApp a partir de Authorization Bearer, X-Api-Key ou padrão da empresa 1.
 */
async function resolveWhatsapp(req: Request, whatsappIdParam?: number): Promise<Whatsapp> {
  if (whatsappIdParam) {
    const byId = await Whatsapp.findByPk(whatsappIdParam);
    if (byId) return byId;
  }

  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers["x-api-key"] as string | undefined;
  let rawToken = "";

  if (authHeader && authHeader.includes(" ")) {
    rawToken = authHeader.split(" ")[1];
  } else if (authHeader) {
    rawToken = authHeader;
  } else if (apiKeyHeader) {
    rawToken = apiKeyHeader;
  }

  const cleanToken = String(rawToken || "").replace(/^["']|["']$/g, "").trim();

  if (cleanToken) {
    const byToken = await Whatsapp.findOne({ where: { token: cleanToken } });
    if (byToken) return byToken;
  }

  // Fallback para conexão padrão da empresa 1 (facilita migração direta de fluxos WAHA/n8n)
  const defaultWhatsapp = await GetDefaultWhatsApp(1);
  return defaultWhatsapp;
}

function extractCleanPhone(input?: string): string {
  if (!input) return "";
  const withoutDomain = String(input).split("@")[0];
  return withoutDomain.replace(/\D/g, "");
}

function toWhatsappJid(cleanPhone: string): string {
  if (cleanPhone.includes("@")) return cleanPhone;
  return `${cleanPhone}@s.whatsapp.net`;
}

/**
 * Localiza ou cria Contato e Ticket para um número caso necessário
 */
async function findOrCreateContactTicket(
  whatsapp: Whatsapp,
  cleanPhone: string,
  ticketId?: number
): Promise<{ contact: Contact; ticket: Ticket | null }> {
  const companyId = whatsapp.companyId;

  if (ticketId) {
    const existingTicket = await Ticket.findByPk(ticketId, {
      include: [{ model: Contact, as: "contact" }]
    });
    if (existingTicket) {
      return { contact: existingTicket.contact, ticket: existingTicket };
    }
  }

  let validJid = toWhatsappJid(cleanPhone);
  let resolvedNumber = cleanPhone;
  try {
    const check: any = await CheckContactNumber(cleanPhone, companyId);
    if (check?.jid) {
      validJid = check.jid;
      resolvedNumber = check.jid.split("@")[0];
    }
  } catch (_) {
    // Mantém o número informado caso o check falhe
  }

  const wbot = getWbot(whatsapp.id);
  const contact = await CreateOrUpdateContactService({
    name: resolvedNumber,
    number: resolvedNumber,
    profilePicUrl: "",
    isGroup: false,
    companyId,
    whatsappId: whatsapp.id,
    remoteJid: validJid,
    wbot
  });

  // Verifica se já existe ticket aberto/pendente para este contato
  const openTicket = await Ticket.findOne({
    where: {
      contactId: contact.id,
      companyId,
      whatsappId: whatsapp.id,
      status: ["open", "pending"]
    }
  });

  if (openTicket) {
    return { contact, ticket: openTicket };
  }

  const settings = await CompaniesSettings.findOne({ where: { companyId } });
  const ticket = await FindOrCreateTicketService(
    contact,
    whatsapp,
    0,
    companyId,
    undefined,
    undefined,
    null,
    whatsapp.channel || "whatsapp",
    null,
    false,
    settings,
    false,
    false
  );

  return { contact, ticket };
}

/**
 * POST /api/sendText
 * Compatível com WAHA ({ session, chatId, text }) e Whaticket ({ number, body, ticketId, transbordo })
 */
export const sendText = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      chatId,
      number,
      text,
      body,
      ticketId,
      transbordo,
      integrationId,
      whatsappId,
      noTicket,
      tag: bodyTag,
      tagName: bodyTagName,
      dadosOrcamento
    } = req.body;

    const rawTarget = chatId || number;
    const rawMessage = text ?? body;

    if (!rawTarget || !rawMessage) {
      return res.status(400).json({
        error: "chatId/number e text/body são obrigatórios"
      });
    }

    const cleanPhone = extractCleanPhone(rawTarget);
    const whatsapp = await resolveWhatsapp(req, whatsappId);
    const wbot = getWbot(whatsapp.id);

    const rawStr = String(rawMessage);
    const hasOrcamentoTag =
      rawStr.includes("<AGUARDANDO_HUMANO>") || rawStr.includes("<TAG_ORCAMENTO>");
    const hasHumanoTag = rawStr.includes("<TAG_HUMANO>");
    const hasImpressaoTag = rawStr.includes("<TAG_IMPRESSAO>");

    // Extrai eventual bloco <DADOS_ORCAMENTO>{...}</DADOS_ORCAMENTO>
    let parsedOrcamento: any = dadosOrcamento || null;
    const matchOrc = rawStr.match(/<DADOS_ORCAMENTO>([\s\S]*?)<\/DADOS_ORCAMENTO>/i);
    if (!parsedOrcamento && matchOrc && matchOrc[1]) {
      try {
        parsedOrcamento = JSON.parse(matchOrc[1].trim());
      } catch (_) {
        parsedOrcamento = { detalhes: matchOrc[1].trim() };
      }
    }

    const cleanText = rawStr
      .replace(/<DADOS_ORCAMENTO>[\s\S]*?<\/DADOS_ORCAMENTO>/gi, "")
      .replace(/<AGUARDANDO_HUMANO>/gi, "")
      .replace(/<TAG_ORCAMENTO>/gi, "")
      .replace(/<TAG_HUMANO>/gi, "")
      .replace(/<TAG_IMPRESSAO>/gi, "")
      .trim();

    let resolvedTagName = String(bodyTag || bodyTagName || "").trim();
    if (!resolvedTagName) {
      if (hasOrcamentoTag) resolvedTagName = "Orçamentos";
      else if (hasImpressaoTag) resolvedTagName = "Impressões Comuns";
      else if (hasHumanoTag) resolvedTagName = "Atendimento Humano";
    }

    const shouldTransfer = Boolean(
      transbordo || hasOrcamentoTag || hasHumanoTag || hasImpressaoTag
    );

    let sentMsg: any = null;
    let resolvedTicket: Ticket | null = null;
    let resolvedContact: Contact | null = null;

    if (noTicket) {
      const jid = toWhatsappJid(cleanPhone);
      sentMsg = await wbot.sendMessage(jid, { text: `\u200e${cleanText}` });
    } else {
      const { contact, ticket } = await findOrCreateContactTicket(whatsapp, cleanPhone, ticketId);
      resolvedTicket = ticket;
      resolvedContact = contact;

      if (ticket) {
        sentMsg = await SendWhatsAppMessage({
          body: cleanText,
          ticket
        });
      } else {
        const jid = toWhatsappJid(cleanPhone);
        sentMsg = await wbot.sendMessage(jid, { text: `\u200e${cleanText}` });
      }
    }

    // Aplica a etiqueta de classificação da triagem no Ticket e no Contato
    if (resolvedTicket && resolvedTagName) {
      await applyTriageTagToTicket(resolvedTicket, resolvedTagName);
    }

    // Se a triagem foi de Orçamentos, registra automaticamente no Painel de Avisos do budget-system
    if (resolvedTagName === "Orçamentos" || parsedOrcamento) {
      await registerOrcamentoSolicitacao({
        clientName:
          parsedOrcamento?.clientName ||
          parsedOrcamento?.nome ||
          resolvedContact?.name ||
          cleanPhone,
        clientPhone: cleanPhone,
        servico:
          parsedOrcamento?.servico ||
          parsedOrcamento?.material ||
          "Orçamento sob medida (WhatsApp)",
        arteStatus: parsedOrcamento?.arte || parsedOrcamento?.arteStatus || "",
        quantidade: parsedOrcamento?.quantidade || "",
        tamanho: parsedOrcamento?.tamanho || "",
        detalhes:
          parsedOrcamento?.resumo ||
          parsedOrcamento?.detalhes ||
          `Triagem concluída no WhatsApp. Última resposta: ${cleanText}`,
        ticketId: resolvedTicket?.id
      });
    }

    // Se houve transbordo (<AGUARDANDO_HUMANO>, <TAG_HUMANO>, <TAG_IMPRESSAO> ou transbordo: true), transfere o ticket
    if (shouldTransfer && resolvedTicket) {
      const targetIntegrationId = integrationId || resolvedTicket.integrationId;
      let integration: QueueIntegrations | null = null;

      if (targetIntegrationId) {
        integration = await QueueIntegrations.findByPk(targetIntegrationId);
      }

      if (resolvedTagName === "Impressões Comuns") {
        await UpdateTicketService({
          ticketId: resolvedTicket.id,
          companyId: resolvedTicket.companyId,
          ticketData: {
            status: "open",
            userId: 1,
            queueId: 3, // Fila Impressões Rápidas
            isBot: false,
            useIntegration: false,
            integrationId: null
          }
        });
      } else if (integration && integration.enableTransfer) {
        await handleIntegrationTransfer(integration, resolvedTicket);
      } else {
        await UpdateTicketService({
          ticketId: resolvedTicket.id,
          companyId: resolvedTicket.companyId,
          ticketData: {
            status: "open",
            userId: 1,
            queueId: 2,
            isBot: false,
            useIntegration: false,
            integrationId: null
          }
        });
      }
      logger.info(`[WAHA-COMPAT] Transbordo humano executado para ticket #${resolvedTicket.id} (Tag: ${resolvedTagName || "N/A"})`);
    }

    const msgId = sentMsg?.key?.id || `msg_${Date.now()}`;
    return res.status(200).json({
      status: "SUCCESS",
      id: {
        id: msgId,
        _serialized: msgId,
        fromMe: true
      },
      ticketId: resolvedTicket?.id,
      tag: resolvedTagName || null,
      transbordo: shouldTransfer
    });
  } catch (err: any) {
    logger.error(`[WAHA-COMPAT sendText] Erro: ${err.message}`);
    return res.status(500).json({ error: err.message || "Erro ao enviar mensagem de texto" });
  }
};

/**
 * POST /api/sendFile  &  POST /api/messages/send/base64
 * Compatível com WAHA ({ chatId, file: { mimetype, filename, data }, caption })
 * Perfeito para envio de PDF de Orçamento em Base64 do print-shop-budget-system
 */
export const sendFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      chatId,
      number,
      file,
      caption,
      body,
      filename: rootFilename,
      mimetype: rootMimetype,
      data: rootBase64,
      ticketId,
      whatsappId
    } = req.body;

    const rawTarget = chatId || number;
    const base64Data = file?.data || rootBase64;
    const fileName = file?.filename || rootFilename || `orcamento_${Date.now()}.pdf`;
    const mimeType = file?.mimetype || rootMimetype || "application/pdf";
    const textCaption = caption ?? body ?? "";

    if (!rawTarget || !base64Data) {
      return res.status(400).json({
        error: "chatId/number e file.data (base64) são obrigatórios"
      });
    }

    const cleanPhone = extractCleanPhone(rawTarget);
    const whatsapp = await resolveWhatsapp(req, whatsappId);
    const companyId = whatsapp.companyId;

    // Remove prefixo data:application/pdf;base64, se existir
    const pureBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(pureBase64, "base64");

    const publicFolder = path.resolve(__dirname, "..", "..", "public");
    const companyFolder = path.join(publicFolder, `company${companyId}`);
    if (!fs.existsSync(companyFolder)) {
      fs.mkdirSync(companyFolder, { recursive: true });
    }

    const safeFileName = `${Date.now()}_${path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(companyFolder, safeFileName);
    fs.writeFileSync(filePath, buffer);

    const { ticket } = await findOrCreateContactTicket(whatsapp, cleanPhone, ticketId);

    const mediaObj = {
      fieldname: "medias",
      originalname: fileName,
      encoding: "7bit",
      mimetype: mimeType,
      filename: safeFileName,
      path: filePath,
      size: buffer.length
    } as Express.Multer.File;

    let sentMsg: any = null;
    if (ticket) {
      sentMsg = await SendWhatsAppMedia({
        media: mediaObj,
        ticket,
        body: textCaption,
        isPrivate: false,
        isForwarded: false
      });

      // Marca o ticket com a etiqueta "Orçamento Enviado" e habilita escuta de resposta do orçamento
      await applyTriageTagToTicket(ticket, "Orçamento Enviado");
      await ticket.update({
        dataWebhook: {
          ...((ticket.dataWebhook as object) || {}),
          waitingQuoteReply: true,
          quoteSentAt: Date.now()
        }
      });
    } else {
      const wbot = getWbot(whatsapp.id);
      const options = await getMessageOptions(safeFileName, filePath, String(companyId), textCaption);
      sentMsg = await wbot.sendMessage(toWhatsappJid(cleanPhone), options);
    }

    const msgId = sentMsg?.key?.id || `file_${Date.now()}`;
    return res.status(200).json({
      status: "SUCCESS",
      id: {
        id: msgId,
        _serialized: msgId,
        fromMe: true
      },
      ticketId: ticket?.id
    });
  } catch (err: any) {
    logger.error(`[WAHA-COMPAT sendFile] Erro: ${err.message}`);
    return res.status(500).json({ error: err.message || "Erro ao enviar arquivo Base64" });
  }
};

/**
 * POST /api/sendSeen
 */
export const sendSeen = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { chatId, number, ticketId, whatsappId } = req.body;
    if (ticketId) {
      const ticket = await Ticket.findByPk(ticketId);
      if (ticket) {
        await SetTicketMessagesAsRead(ticket);
      }
    } else if (chatId || number) {
      const cleanPhone = extractCleanPhone(chatId || number);
      const whatsapp = await resolveWhatsapp(req, whatsappId);
      const contact = await Contact.findOne({
        where: { number: cleanPhone, companyId: whatsapp.companyId }
      });
      if (contact) {
        const ticket = await Ticket.findOne({
          where: { contactId: contact.id, companyId: whatsapp.companyId, status: ["open", "pending"] }
        });
        if (ticket) {
          await SetTicketMessagesAsRead(ticket);
        }
      }
    }
    return res.status(200).json({ status: "SUCCESS" });
  } catch (err: any) {
    return res.status(200).json({ status: "SUCCESS", note: err.message });
  }
};

/**
 * POST /api/startTyping
 */
export const startTyping = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { chatId, number, whatsappId } = req.body;
    const cleanPhone = extractCleanPhone(chatId || number);
    if (cleanPhone) {
      const whatsapp = await resolveWhatsapp(req, whatsappId);
      const wbot = getWbot(whatsapp.id);
      await wbot.sendPresenceUpdate("composing", toWhatsappJid(cleanPhone));
    }
    return res.status(200).json({ status: "SUCCESS" });
  } catch (err: any) {
    return res.status(200).json({ status: "SUCCESS", note: err.message });
  }
};

/**
 * GET /api/contacts/check-exists?session=default&phone=5591...
 */
export const checkExists = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawPhone = (req.query.phone || req.body?.phone || req.body?.number) as string;
    const cleanPhone = extractCleanPhone(rawPhone);

    if (!cleanPhone) {
      return res.status(400).json({
        numberExists: false,
        existsInWhatsapp: false,
        error: "Parâmetro phone é obrigatório"
      });
    }

    const whatsapp = await resolveWhatsapp(req);
    const companyId = whatsapp.companyId;

    try {
      const check: any = await CheckContactNumber(cleanPhone, companyId);
      if (check?.jid) {
        const resolvedPhone = check.jid.split("@")[0];
        return res.status(200).json({
          numberExists: true,
          existsInWhatsapp: true,
          chatId: `${resolvedPhone}@c.us`,
          jid: check.jid,
          number: resolvedPhone,
          numberFormatted: check.jid
        });
      }
    } catch (_) {
      // Fallback caso o wbot não esteja conectado no momento do teste
    }

    const wbot = getWbot(whatsapp.id);
    const [result] = (await wbot.onWhatsApp(toWhatsappJid(cleanPhone))) as {
      exists: boolean;
      jid: string;
    }[];

    if (result?.exists) {
      const resolvedPhone = result.jid.split("@")[0];
      return res.status(200).json({
        numberExists: true,
        existsInWhatsapp: true,
        chatId: `${resolvedPhone}@c.us`,
        jid: result.jid,
        number: resolvedPhone,
        numberFormatted: result.jid
      });
    }

    return res.status(200).json({
      numberExists: false,
      existsInWhatsapp: false,
      chatId: null
    });
  } catch (err: any) {
    logger.warn(`[WAHA-COMPAT checkExists] ${err.message}`);
    return res.status(200).json({
      numberExists: false,
      existsInWhatsapp: false,
      error: err.message
    });
  }
};

/**
 * GET /api/:session/chats/:chatId/messages/:messageId
 * Usado pelo workflow_orcamento.json ("Consultar Status da Mensagem") para verificar entrega (ack >= 2)
 */
export const getMessageStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { messageId, chatId } = req.params;
    const msg = await Message.findOne({
      where: { wid: messageId }
    });

    return res.status(200).json({
      id: messageId,
      chatId,
      ack: msg?.ack && msg.ack >= 2 ? msg.ack : 2,
      body: msg?.body || ""
    });
  } catch (err: any) {
    return res.status(200).json({
      id: req.params.messageId,
      ack: 2
    });
  }
};
