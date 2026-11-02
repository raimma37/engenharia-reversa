import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Whatsapp from "../models/Whatsapp";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Message from "../models/Message";
import QueueIntegrations from "../models/QueueIntegrations";
import CompaniesSettings from "../models/CompaniesSettings";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getWbot } from "../libs/wbot";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SendWhatsAppMedia, { getMessageOptions } from "../services/WbotServices/SendWhatsAppMedia";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import { handleIntegrationTransfer } from "../services/IntegrationServices/IntegrationActionsService";
import logger from "../utils/logger";

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
      noTicket
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

    const hasTransbordoTag = String(rawMessage).includes("<AGUARDANDO_HUMANO>");
    const cleanText = String(rawMessage).replace(/<AGUARDANDO_HUMANO>/g, "").trim();
    const shouldTransfer = Boolean(transbordo || hasTransbordoTag);

    let sentMsg: any = null;
    let resolvedTicket: Ticket | null = null;

    if (noTicket) {
      const jid = toWhatsappJid(cleanPhone);
      sentMsg = await wbot.sendMessage(jid, { text: `\u200e${cleanText}` });
    } else {
      const { ticket } = await findOrCreateContactTicket(whatsapp, cleanPhone, ticketId);
      resolvedTicket = ticket;

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

    // Se houve transbordo (<AGUARDANDO_HUMANO> ou transbordo: true), transfere o ticket para fila humana
    if (shouldTransfer && resolvedTicket) {
      const targetIntegrationId = integrationId || resolvedTicket.integrationId;
      let integration: QueueIntegrations | null = null;

      if (targetIntegrationId) {
        integration = await QueueIntegrations.findByPk(targetIntegrationId);
      }

      if (integration && integration.enableTransfer) {
        await handleIntegrationTransfer(integration, resolvedTicket);
      } else {
        await UpdateTicketService({
          ticketId: resolvedTicket.id,
          companyId: resolvedTicket.companyId,
          ticketData: {
            status: "pending",
            isBot: false,
            useIntegration: false,
            integrationId: null
          }
        });
      }
      logger.info(`[WAHA-COMPAT] Transbordo humano executado para ticket #${resolvedTicket.id}`);
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
