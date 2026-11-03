import axios from "axios";
import {
  WASocket,
  BinaryNode,
  Contact as BContact,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
  extractMessageContent,
  getContentType
} from "@whiskeysockets/baileys";
import { handleLabelsEdit, handleLabelsAssociation } from "../TagServices/WhatsAppLabelSyncService";
import * as Sentry from "@sentry/node";
import fs from "fs";

interface BaileysCallEvent {
  chatId?: string;
  from: string;
  id: string;
  date?: Date;
  isVideo?: boolean;
  status: string;
  isGroup?: boolean;
}

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import logger from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import ShowQueueIntegrationService from "../QueueIntegrationServices/ShowQueueIntegrationService";
import QueueIntegrations from "../../models/QueueIntegrations";
import CompaniesSettings from "../../models/CompaniesSettings";
import path from "path";
import { verifyMessage, getBodyMessage, getTypeMessage } from "./wbotMessageListener";

// Rate limiter para callbacks de chamada
let callCounter = 0;
let callCounterResetTimer: ReturnType<typeof setInterval> | null = null;

const ensureCallCounterTimer = () => {
  if (!callCounterResetTimer) {
    callCounterResetTimer = setInterval(() => {
      callCounter = 0;
    }, 5000);
  }
};

// Limpar timer ao descarregar módulo
const cleanupCallTimer = () => {
  if (callCounterResetTimer) {
    clearInterval(callCounterResetTimer);
    callCounterResetTimer = null;
  }
};
process.once('SIGTERM', cleanupCallTimer);
process.once('SIGINT', cleanupCallTimer);

ensureCallCounterTimer();

type Session = WASocket & {
  id?: number;
};

interface IContact {
  contacts: BContact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  try {
    // Cache de chamadas processadas para evitar processamento duplicado (TTL: 60s)
    const processedCalls = new Set<string>();
    const markCallProcessed = (callId: string) => {
      processedCalls.add(callId);
      setTimeout(() => {
        processedCalls.delete(callId);
      }, 60000);
    };

    const handleIncomingCall = async (call: {
      id: string;
      from: string;
      status: string;
      isVideo?: boolean;
      isGroup?: boolean;
    }) => {
      if (!call.from || call.from.includes("@g.us") || call.from.includes("@call")) {
        return;
      }

      if (processedCalls.has(call.id)) {
        return;
      }
      markCallProcessed(call.id);

      logger.info(
        `[WBOT CALL] Evento de chamada recebido na conexão ${whatsapp.id}: id=${call.id}, from=${call.from}, status=${call.status}, isVideo=${call.isVideo}`
      );

      const settings = await CompaniesSettings.findOne({
        where: { companyId },
      });

      if (!settings) return;

      // Se a empresa optou por não aceitar chamadas ("enabled" na UI de rejeição de chamadas)
      const rejectEnabled = settings.acceptCallWhatsapp === "enabled";

      if (!rejectEnabled) {
        logger.info(`[WBOT CALL] Conexão ${whatsapp.id} aceita chamadas normalmente.`);
        return;
      }

      // 1. REJEITAR A LIGAÇÃO NO WHATSAPP IMEDIATAMENTE (desliga no aparelho do cliente)
      try {
        if (typeof (wbot as any).rejectCall === "function") {
          await (wbot as any).rejectCall(call.id, call.from);
          logger.info(`[WBOT CALL] ✅ Chamada ${call.id} de ${call.from} desligada com sucesso via rejectCall.`);
        }
      } catch (rejectErr: any) {
        logger.error(`[WBOT CALL] Falha ao rejeitar chamada ${call.id}: ${rejectErr?.message || rejectErr}`);
      }

      // 2. OBTER OU CRIAR CONTATO E TICKET
      const rawNumber = call.from.split("@")[0].split(":")[0].replace(/\D/g, "");
      let contact = await Contact.findOne({
        where: { companyId, number: rawNumber },
      });

      if (!contact) {
        contact = await CreateOrUpdateContactService({
          name: rawNumber,
          number: rawNumber,
          isGroup: Boolean(call.isGroup),
          companyId
        });
      }

      const [ticket] = await Ticket.findOrCreate({
        where: {
          contactId: contact.id,
          whatsappId: whatsapp.id,
          status: ["open", "pending", "nps", "lgpd"],
          companyId
        },
        defaults: {
          companyId,
          contactId: contact.id,
          whatsappId: whatsapp.id,
          isGroup: Boolean(call.isGroup),
          status: "pending"
        }
      });

      if (!ticket) return;

      // 3. REGISTRAR O LOG DA CHAMADA NO CHAT/TICKET
      const date = new Date();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const callType = call.isVideo ? "vídeo" : "voz";
      const callLogBody = `Chamada de ${callType} recusada às ${hours}:${minutes}`;

      try {
        await CreateMessageService({
          messageData: {
            wid: call.id,
            ticketId: ticket.id,
            contactId: contact.id,
            body: callLogBody,
            fromMe: false,
            mediaType: "call_log",
            read: true,
            ack: 1,
          },
          companyId
        });

        await ticket.update({
          lastMessage: callLogBody,
          ...(ticket.status === "closed" ? { status: "pending" } : {})
        });
      } catch (logErr: any) {
        logger.error(`[WBOT CALL] Erro ao registrar log da chamada no ticket: ${logErr?.message || logErr}`);
      }

      // 4. REGRA DE NÃO CONFLITO COM O N8N:
      // Verifica se o ticket ou a conexão possui integração com n8n ativa
      let integrationId = ticket.integrationId || whatsapp.integrationId;
      let queueIntegration: QueueIntegrations | null = null;

      if (integrationId) {
        try {
          queueIntegration = await ShowQueueIntegrationService(integrationId, companyId);
        } catch (intErr: any) {
          logger.warn(`[WBOT CALL] Integração ${integrationId} não localizada: ${intErr?.message || intErr}`);
        }
      }

      const isN8nActive =
        Boolean(queueIntegration?.urlN8N) &&
        (queueIntegration?.type === "n8n" || queueIntegration?.type === "webhook") &&
        !contact.disableBot &&
        !ticket.isGroup &&
        !ticket.userId &&
        ticket.status !== "open" &&
        ticket.isBot !== false;

      if (isN8nActive && queueIntegration?.urlN8N) {
        // Envia evento call.received para o n8n.
        // O n8n responderá via Cenário 4 com tom humanizado ("Poxa, me desculpe! O sistema não aceita chamadas...").
        // O Whaticket NÃO envia mensagem direta para evitar conflito/duplicação.
        logger.info(`[WBOT CALL] Notificando n8n (call.received) para ticket ${ticket.id} — resposta delegada à IA`);

        const urls = String(queueIntegration.urlN8N)
          .split(/[,;\s]+/)
          .map(u => u.trim())
          .filter(Boolean);

        const n8nPayload = {
          event: "call.received",
          key: {
            remoteJid: `${rawNumber}@s.whatsapp.net`,
            fromMe: false,
            id: call.id
          },
          payload: {
            id: call.id,
            from: `${rawNumber}@c.us`,
            to: "me@c.us",
            fromMe: false,
            body: "",
            type: "call",
            hasMedia: false,
            ticketId: ticket.id,
            companyId: ticket.companyId,
            contactName: contact.name || rawNumber
          },
          _integrationConfig: {
            integrationId: queueIntegration.id,
            enableTransfer: queueIntegration.enableTransfer,
            transferQueueId: queueIntegration.transferQueueId,
            transferUserId: queueIntegration.transferUserId,
            ticketId: ticket.id,
            companyId: ticket.companyId
          }
        };

        for (const targetUrl of urls) {
          try {
            axios.post(targetUrl, n8nPayload, {
              headers: { "Content-Type": "application/json" },
              timeout: 10000
            }).catch(axiosErr => {
              logger.error(`[WBOT CALL] Erro assíncrono ao notificar n8n (${targetUrl}): ${axiosErr?.message || axiosErr}`);
            });
          } catch (n8nErr: any) {
            logger.error(`[WBOT CALL] Falha ao disparar para n8n (${targetUrl}): ${n8nErr?.message || n8nErr}`);
          }
        }
      } else {
        // SEM N8N ATIVO (atendimento humano, bot desligado ou sem n8n):
        // Envia mensagem direta do Whaticket com o texto configurado ou fallback padrão
        const defaultMsg = "*Mensagem Automática:*\n\nAs chamadas de voz e vídeo estão desabilitadas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado";
        const textToSend = settings.AcceptCallWhatsappMessage?.trim() || defaultMsg;

        logger.info(`[WBOT CALL] Enviando mensagem de recusa nativa do Whaticket para ${call.from}`);

        try {
          const sentMessage = await wbot.sendMessage(call.from, {
            text: `\u200e ${textToSend}`
          });
          await verifyMessage(sentMessage, ticket, contact);
        } catch (msgErr: any) {
          logger.error(`[WBOT CALL] Erro ao enviar mensagem de aviso de chamada para ${call.from}: ${msgErr?.message || msgErr}`);
        }
      }
    };

    // ✅ Baileys v7: Evento oficial de chamada 'call'
    wbot.ev.on("call" as any, async (callEvents: BaileysCallEvent[]) => {
      try {
        for (const call of callEvents) {
          await handleIncomingCall({
            id: call.id,
            from: call.from || call.chatId,
            status: call.status,
            isVideo: call.isVideo,
            isGroup: call.isGroup
          });
        }
      } catch (err: any) {
        logger.error(`[WBOT CALL] Erro no listener ev.on('call'): ${err?.message || err}`);
      }
    });

    // Fallback: Evento 'CB:call' em caso de stanzas brutas não capturadas
    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      try {
        const content = node.content[0] as any;
        if (!content) return;
        const callId = content.attrs?.["call-id"] || node.attrs?.id || `call_${Date.now()}`;
        const from = node.attrs?.from;
        if (!from) return;

        await handleIncomingCall({
          id: callId,
          from,
          status: content.tag || "offer",
          isVideo: false,
          isGroup: from.includes("@g.us")
        });
      } catch (err: any) {
        logger.error(`[WBOT CALL] Erro no listener ws.on('CB:call'): ${err?.message || err}`);
      }
    });

    // Flag para evitar escritas concorrentes no arquivo
    let isWritingContactFile = false;

    function cleanStringForJSON(str: string) {
      // Remove apenas caracteres de controle (preserva aspas pois JSON.stringify cuida do escape)
      return str.replace(/[\x00-\x1F\x7F]/g, "");
    }

    // Função auxiliar para salvar contatos no arquivo e Baileys DB
    const saveContactsToFileAndDB = async (filteredContacts: any[], source: string) => {
      if (filteredContacts.length === 0) return;

      // Salvar no arquivo
      const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
      const companyFolder = path.join(publicFolder, `company${companyId}`);
      if (!fs.existsSync(companyFolder)) {
        fs.mkdirSync(companyFolder, { recursive: true });
        fs.chmodSync(companyFolder, 0o777);
      }
      const contatcJson = path.join(companyFolder, `contactJson-wpp${whatsapp.id}.txt`);

      // Merge com existentes
      let existingContacts: any[] = [];
      if (fs.existsSync(contatcJson)) {
        try {
          const content = await fs.promises.readFile(contatcJson, 'utf-8');
          existingContacts = JSON.parse(content);
          if (!Array.isArray(existingContacts)) existingContacts = [];
        } catch { existingContacts = []; }
      }

      for (const newContact of filteredContacts) {
        const idx = existingContacts.findIndex(c => c.id === newContact.id);
        if (idx >= 0) existingContacts[idx] = newContact;
        else existingContacts.push(newContact);
      }

      const tempFile = `${contatcJson}.tmp`;
      await fs.promises.writeFile(tempFile, JSON.stringify(existingContacts), 'utf-8');
      await fs.promises.rename(tempFile, contatcJson);
      logger.info(`[${source}] ✅ Arquivo salvo: ${existingContacts.length} contatos totais (${filteredContacts.length} novos/atualizados) para wpp ${whatsapp.id}`);

      // Salvar no Baileys DB
      try {
        await createOrUpdateBaileysService({
          whatsappId: whatsapp.id,
          contacts: filteredContacts,
        });
        logger.info(`[${source}] ✅ Baileys DB atualizado com ${filteredContacts.length} contatos`);
      } catch (err) {
        logger.error(`[${source}] Erro ao salvar no Baileys DB: ${err.message}`);
      }
    };

    // Função auxiliar para filtrar contatos válidos
    const filterValidContacts = (contacts: any[]): any[] => {
      const filtered: any[] = [];
      for (const contact of contacts) {
        const id = contact.id || "";
        if (!id || isJidBroadcast(id) || isJidStatusBroadcast(id) || id.includes("@g.us") || id.includes("@newsletter")) continue;
        filtered.push({
          id,
          name: contact.name ? cleanStringForJSON(contact.name) : id.split('@')[0].split(':')[0]
        });
      }
      return filtered;
    };

    // ✅ Baileys v7: messaging-history.set é o evento PRINCIPAL para sync inicial
    // ✅ messaging-history.set: APENAS salvar contatos e chats (sem processar mensagens históricas)
    // O processamento de mensagens históricas foi REMOVIDO pois causava picos de CPU
    // com N+1 queries ao banco (Message.findOne + Contact.findOne + Ticket.findOne por msg)
    wbot.ev.on("messaging-history.set" as any, async (data: any) => {
      try {
        const contacts = data?.contacts || [];
        const chats = data?.chats || [];

        logger.info(
          `[HISTORY SET] Evento recebido para wpp ${whatsapp.id} — ` +
          `contatos: ${contacts.length}, chats: ${chats.length} (mensagens ignoradas para performance)`
        );

        // Salvar contatos
        if (contacts.length > 0) {
          const filtered = filterValidContacts(contacts);
          if (filtered.length > 0) {
            await saveContactsToFileAndDB(filtered, "HISTORY SET");
          }
        }

        // Salvar chats no Baileys DB
        if (chats.length > 0) {
          try {
            await createOrUpdateBaileysService({
              whatsappId: whatsapp.id,
              chats: chats.map((c: any) => ({ id: c.id, name: c.name || c.id })),
            });
            logger.info(`[HISTORY SET] ✅ ${chats.length} chats salvos no Baileys DB`);
          } catch (chatErr) {
            logger.error(`[HISTORY SET] Erro ao salvar chats: ${chatErr.message}`);
          }
        }
      } catch (err) {
        logger.error(`[HISTORY SET] Erro: ${err.message}`);
        Sentry.captureException(err);
      }
    });

    // ✅ Baileys v7: contacts.set pode trazer snapshot inicial em alguns dispositivos
    wbot.ev.on("contacts.set" as any, async (payload: any) => {
      try {
        const contacts = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.contacts)
            ? payload.contacts
            : [];

        if (contacts.length === 0) {
          logger.info(`[CONTACTS SET] Evento recebido sem contatos para wpp ${whatsapp.id}`);
          return;
        }

        logger.info(`[CONTACTS SET] Recebidos ${contacts.length} contatos para wpp ${whatsapp.id}`);
        const filtered = filterValidContacts(contacts);
        if (filtered.length > 0) {
          await saveContactsToFileAndDB(filtered, "CONTACTS SET");
        }
      } catch (err) {
        logger.error(`[CONTACTS SET] Erro: ${err.message}`);
        Sentry.captureException(err);
      }
    });

    // ✅ Baileys v7: contacts.upsert para contatos adicionados depois do sync inicial
    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {
      try {
        const filtered = filterValidContacts(contacts);
        if (filtered.length === 0) {
          logger.info(`[CONTACTS UPSERT] Nenhum contato válido para salvar`);
          return;
        }
        await saveContactsToFileAndDB(filtered, "CONTACTS UPSERT");
      } catch (err) {
        Sentry.captureException(err);
        logger.error(`Erro contacts.upsert: ${err.message}`);
      }
    });

    // ✅ Baileys v7: contacts.update para alterações de contatos existentes
    wbot.ev.on("contacts.update" as any, async (updates: any[]) => {
      try {
        if (!updates || updates.length === 0) return;
        const filtered = filterValidContacts(updates);
        if (filtered.length > 0) {
          await saveContactsToFileAndDB(filtered, "CONTACTS UPDATE");
        }
      } catch (err) {
        logger.error(`Erro contacts.update: ${err.message}`);
      }
    });

    // ========== LISTENERS DE LABELS DO WHATSAPP ==========

    // Evento: labels editadas (criadas, renomeadas, deletadas)
    wbot.ev.on("labels.edit" as any, (labels: any) => {
      logger.info(`[LABEL SYNC] Evento labels.edit recebido (conexão ${whatsapp.id}): ${JSON.stringify(labels)}`);
      const labelsArray = Array.isArray(labels) ? labels : [labels];
      // Offload processamento para background para não bloquear o event loop do Baileys
      setImmediate(async () => {
        try {
          await handleLabelsEdit(companyId, labelsArray);
        } catch (err) {
          logger.error(`[LABEL SYNC] Erro no listener labels.edit: ${(err as any)?.message}`);
        }
      });
    });

    // Evento: labels associadas/desassociadas a chats
    // ⚠️ TEMPORARIAMENTE DESABILITADO: listener causa device_removed/conflict ao receber eventos de remoção
    // Hipótese: WhatsApp detecta escuta de eventos de labels como comportamento não autorizado
    // TODO: Investigar alternativa ou manter sincronização unidirecional (sistema → WhatsApp apenas)
    // wbot.ev.on("labels.association" as any, (data: any) => {
    //   logger.info(`[LABEL SYNC] Evento labels.association recebido (conexão ${whatsapp.id}): ${JSON.stringify(data)}`);
    //   // Offload processamento para background para não bloquear o event loop do Baileys
    //   setImmediate(async () => {
    //     try {
    //       await handleLabelsAssociation(companyId, whatsapp.id, data);
    //     } catch (err) {
    //       logger.error(`[LABEL SYNC] Erro no listener labels.association: ${(err as any)?.message}`);
    //     }
    //   });
    // });

    logger.info(`[LABEL SYNC] Listeners de labels registrados para conexão ${whatsapp.id} (labels.association DESABILITADO)`);

  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;