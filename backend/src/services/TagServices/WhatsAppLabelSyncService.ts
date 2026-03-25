import Tag from "../../models/Tag";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";
import Ticket from "../../models/Ticket";
import { getWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import logger from "../../utils/logger";
import { Op } from "sequelize";

// Fila local por sessão para serializar operações de label e evitar chamadas concorrentes
const labelOpQueues = new Map<number, Array<() => Promise<void>>>();

const enqueueLabelOp = (whatsappId: number, fn: () => Promise<void>): void => {
  if (!labelOpQueues.has(whatsappId)) labelOpQueues.set(whatsappId, []);
  const q = labelOpQueues.get(whatsappId)!;
  q.push(fn);
  if (q.length === 1) runNextLabelOp(whatsappId);
};

const runNextLabelOp = (whatsappId: number): void => {
  const q = labelOpQueues.get(whatsappId) || [];
  if (q.length === 0) return;
  const fn = q[0];
  fn()
    .catch(err => logger.warn(`[LABEL SYNC] Erro em operação de label (whatsapp ${whatsappId}): ${err?.message || err}`))
    .finally(() => {
      q.shift();
      if (q.length > 0) setImmediate(() => runNextLabelOp(whatsappId));
    });
};

const isWbotReady = (wbot: any): boolean => {
  try {
    const wsAny = (wbot as any).ws;
    const readyState = wsAny?.readyState;
    const isClosed = wsAny?.isClosed;
    return (typeof readyState === 'number' && readyState === 1) || (typeof isClosed === 'boolean' && !isClosed) || !!wbot?.user?.id;
  } catch {
    return false;
  }
};

/**
 * Cores padrão das labels do WhatsApp (mapeadas para hex)
 */
const WA_LABEL_COLORS: Record<number, string> = {
  0: "#00a0f2", // Azul
  1: "#00c853", // Verde
  2: "#ff6f00", // Laranja
  3: "#ff1744", // Vermelho
  4: "#aa00ff", // Roxo
  5: "#64dd17", // Verde limão
  6: "#ffab00", // Amarelo
  7: "#00bfa5", // Teal
  8: "#2962ff", // Azul escuro
  9: "#e91e63", // Rosa
  10: "#795548", // Marrom
  11: "#607d8b", // Cinza azulado
  12: "#9e9e9e", // Cinza
  13: "#4caf50", // Verde médio
  14: "#ff9800", // Laranja claro
  15: "#3f51b5", // Índigo
  16: "#673ab7", // Roxo médio
  17: "#009688", // Teal escuro
  18: "#f44336", // Vermelho médio
  19: "#cddc39", // Lima
};

/**
 * Importa labels do WhatsApp para o sistema como Tags
 */
export const importWhatsAppLabels = async (
  companyId: number,
  whatsappId: number
): Promise<{ imported: number; updated: number; total: number }> => {
  let imported = 0;
  let updated = 0;

  try {
    const wbot = getWbot(whatsappId);

    // Buscar labels do WhatsApp
    // O Baileys disponibiliza labels no store ou via fetchLabels (dependendo da versão)
    let labels: any[] = [];

    // Tentar buscar labels via método direto
    if (typeof (wbot as any).fetchLabels === "function") {
      labels = await (wbot as any).fetchLabels();
    } else if ((wbot as any).store?.labels) {
      // Fallback: buscar do store em memória
      const labelsMap = (wbot as any).store.labels;
      labels = Object.values(labelsMap);
    }

    if (!labels || labels.length === 0) {
      logger.info(`[LABEL SYNC] Nenhuma label encontrada no WhatsApp (conexão ${whatsappId})`);
      return { imported: 0, updated: 0, total: 0 };
    }

    logger.info(`[LABEL SYNC] ${labels.length} labels encontradas no WhatsApp (conexão ${whatsappId})`);

    for (const label of labels) {
      const labelId = String(label.id);
      const labelName = label.name || `Label ${labelId}`;
      const labelColor = WA_LABEL_COLORS[label.color || label.predefinedId || 0] || "#A4CCCC";

      // Verificar se já existe uma tag com este whatsappLabelId
      let existingTag = await Tag.findOne({
        where: { whatsappLabelId: labelId, companyId }
      });

      if (existingTag) {
        // Atualizar nome/cor se mudou
        if (existingTag.name !== labelName || existingTag.color !== labelColor) {
          await existingTag.update({ name: labelName, color: labelColor });
          updated++;
          logger.info(`[LABEL SYNC] Tag atualizada: "${labelName}" (labelId: ${labelId})`);
        }
      } else {
        // Verificar se existe tag com mesmo nome (vincular)
        existingTag = await Tag.findOne({
          where: { name: labelName, companyId }
        });

        if (existingTag) {
          await existingTag.update({ whatsappLabelId: labelId, color: labelColor });
          updated++;
          logger.info(`[LABEL SYNC] Tag existente vinculada: "${labelName}" → labelId: ${labelId}`);
        } else {
          // Criar nova tag
          await Tag.create({
            name: labelName,
            color: labelColor,
            kanban: 0,
            companyId,
            whatsappLabelId: labelId
          });
          imported++;
          logger.info(`[LABEL SYNC] Nova tag criada: "${labelName}" (labelId: ${labelId})`);
        }
      }
    }

    logger.info(`[LABEL SYNC] Sincronização concluída: ${imported} importadas, ${updated} atualizadas, ${labels.length} total`);
    return { imported, updated, total: labels.length };
  } catch (error) {
    logger.error(`[LABEL SYNC] Erro ao importar labels: ${error.message}`);
    throw error;
  }
};

/**
 * Sincroniza labels de um chat específico no WhatsApp com as tags do contato no sistema
 */
export const syncChatLabelsToSystem = async (
  companyId: number,
  whatsappId: number,
  jid: string,
  labelIds: string[]
): Promise<void> => {
  try {
    // Encontrar o contato pelo número
    const number = jid.split("@")[0];
    const contact = await Contact.findOne({
      where: { number, companyId }
    });

    if (!contact) {
      logger.warn(`[LABEL SYNC] Contato não encontrado para JID: ${jid}`);
      return;
    }

    // Buscar tags do sistema que correspondem às labels
    const tags = await Tag.findAll({
      where: {
        whatsappLabelId: { [Op.in]: labelIds },
        companyId
      }
    });

    if (tags.length === 0) {
      logger.info(`[LABEL SYNC] Nenhuma tag mapeada para labels: ${labelIds.join(", ")}`);
      return;
    }

    // Sincronizar ContactTags
    for (const tag of tags) {
      await ContactTag.findOrCreate({
        where: { contactId: contact.id, tagId: tag.id }
      });
    }

    // Remover tags que não estão mais nas labels do WhatsApp
    const tagIdsToKeep = tags.map(t => t.id);
    const allMappedTags = await Tag.findAll({
      where: {
        whatsappLabelId: { [Op.not]: null },
        companyId
      }
    });
    const allMappedTagIds = allMappedTags.map(t => t.id);
    const tagIdsToRemove = allMappedTagIds.filter(id => !tagIdsToKeep.includes(id));

    if (tagIdsToRemove.length > 0) {
      await ContactTag.destroy({
        where: {
          contactId: contact.id,
          tagId: { [Op.in]: tagIdsToRemove }
        }
      });
    }

    logger.info(`[LABEL SYNC] Labels do chat ${jid} sincronizadas com contato ${contact.id}: ${tags.map(t => t.name).join(", ")}`);
  } catch (error) {
    logger.error(`[LABEL SYNC] Erro ao sincronizar labels do chat: ${error.message}`);
  }
};

/**
 * Quando uma tag é adicionada a um contato no sistema, aplica a label correspondente no WhatsApp
 */
export const pushTagToWhatsApp = async (
  companyId: number,
  contactId: number,
  tagId: number
): Promise<void> => {
  // ⚠️ DESABILITADO: addChatLabel causa device_removed/conflict
  // WhatsApp detecta uso de addChatLabel como comportamento não autorizado
  // Sincronização de tags agora é unidirecional: WhatsApp → Sistema (via labels.edit)
  // TODO: Investigar API oficial ou manter apenas importação periódica de labels
  logger.debug(`[LABEL SYNC] pushTagToWhatsApp desabilitado - tagId: ${tagId}, contactId: ${contactId}`);
  return;
};

/**
 * Quando uma tag é removida de um contato no sistema, remove a label correspondente no WhatsApp
 */
export const removeTagFromWhatsApp = async (
  companyId: number,
  contactId: number,
  tagId: number
): Promise<void> => {
  // ⚠️ DESABILITADO: removeChatLabel causa device_removed/conflict
  // WhatsApp detecta uso de removeChatLabel como comportamento não autorizado
  // Sincronização de tags agora é unidirecional: WhatsApp → Sistema (via labels.edit)
  logger.debug(`[LABEL SYNC] removeTagFromWhatsApp desabilitado - tagId: ${tagId}, contactId: ${contactId}`);
  return;
};

/**
 * Processa evento labels.edit do Baileys (criação/edição de labels)
 */
export const handleLabelsEdit = async (
  companyId: number,
  labels: any[]
): Promise<void> => {
  try {
    for (const label of labels) {
      const labelId = String(label.id);
      const labelName = label.name || `Label ${labelId}`;
      const labelColor = WA_LABEL_COLORS[label.color || label.predefinedId || 0] || "#A4CCCC";

      const existingTag = await Tag.findOne({
        where: { whatsappLabelId: labelId, companyId }
      });

      if (existingTag) {
        if (label.deleted) {
          // Label deletada no WhatsApp - remover vínculo (não deletar tag)
          await existingTag.update({ whatsappLabelId: null });
          logger.info(`[LABEL SYNC] Vínculo removido da tag "${existingTag.name}" (label deletada no WhatsApp)`);
        } else {
          await existingTag.update({ name: labelName, color: labelColor });
          logger.info(`[LABEL SYNC] Tag atualizada via evento: "${labelName}"`);
        }
      } else if (!label.deleted) {
        // Tentar vincular por nome
        const tagByName = await Tag.findOne({
          where: { name: labelName, companyId }
        });

        if (tagByName) {
          await tagByName.update({ whatsappLabelId: labelId, color: labelColor });
          logger.info(`[LABEL SYNC] Tag vinculada por nome: "${labelName}" → ${labelId}`);
        } else {
          await Tag.create({
            name: labelName,
            color: labelColor,
            kanban: 0,
            companyId,
            whatsappLabelId: labelId
          });
          logger.info(`[LABEL SYNC] Nova tag criada via evento: "${labelName}"`);
        }
      }
    }
  } catch (error) {
    logger.error(`[LABEL SYNC] Erro ao processar labels.edit: ${error.message}`);
  }
};

/**
 * Processa evento labels.association do Baileys (vinculação de labels a chats)
 */
export const handleLabelsAssociation = async (
  companyId: number,
  whatsappId: number,
  data: { association: any; type: string }
): Promise<void> => {
  try {
    const { association, type } = data;

    if (type !== "add" && type !== "remove") {
      logger.warn(`[LABEL SYNC] Tipo de associação desconhecido: ${type}`);
      return;
    }

    // ⚠️ TEMPORÁRIO: Desabilitar processamento de remoções via WhatsApp
    // Causa: remoções disparam device_removed/conflict imediatamente após
    // Estratégia: processar apenas adições; remoções só via sistema
    if (type === "remove") {
      logger.info(`[LABEL SYNC] Remoção de label ignorada (processamento desabilitado temporariamente) - labelId: ${association.labelId}`);
      return;
    }

    const chatId = association.chatId || association.jid;
    const labelId = String(association.labelId);

    if (!chatId) {
      logger.warn(`[LABEL SYNC] chatId não encontrado na associação`);
      return;
    }

    const number = chatId.split("@")[0];
    const contact = await Contact.findOne({
      where: { number, companyId }
    });

    if (!contact) {
      logger.warn(`[LABEL SYNC] Contato não encontrado para número: ${number}`);
      return;
    }

    const tag = await Tag.findOne({
      where: { whatsappLabelId: labelId, companyId }
    });

    if (!tag) {
      logger.warn(`[LABEL SYNC] Tag não encontrada para labelId: ${labelId}`);
      return;
    }

    if (type === "add") {
      await ContactTag.findOrCreate({
        where: { contactId: contact.id, tagId: tag.id }
      });
      logger.info(`[LABEL SYNC] Tag "${tag.name}" adicionada ao contato ${contact.id} via WhatsApp`);
    }
  } catch (error) {
    logger.error(`[LABEL SYNC] Erro ao processar labels.association: ${error.message}`);
  }
};

export default {
  importWhatsAppLabels,
  syncChatLabelsToSystem,
  pushTagToWhatsApp,
  removeTagFromWhatsApp,
  handleLabelsEdit,
  handleLabelsAssociation
};
