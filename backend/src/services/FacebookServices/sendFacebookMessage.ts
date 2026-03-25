import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { sendText, sendInstagramPrivateReply } from "./graphAPI";
import formatBody from "../../helpers/Mustache";
import Whatsapp from "../../models/Whatsapp";
import { Op } from "sequelize";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

interface RequestWithoutTicket {
  body: string;
  number: string;
  whatsapp: Whatsapp;
}

const sendFacebookMessage = async ({ body, ticket, quotedMsg }: Request): Promise<any> => {
  try {
    // ✅ CORRIGIDO: Recarregar ticket com todas as relações necessárias para formatBody
    const ticketWithRelations = await ShowTicketService(ticket.id, ticket.companyId);
    const { number } = ticketWithRelations.contact;
    
    const lastMessage = await Message.findOne({
      where: {
        ticketId: { [Op.lte]: ticket.id },
        companyId: ticket.companyId,
        contactId: ticket.contactId,
        fromMe: false
      },
      order: [["createdAt", "DESC"]],
      limit: 1
    });

    const twentyFourHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);
    let tag = null;

    if (!lastMessage || lastMessage.createdAt < twentyFourHoursAgo) {
      if (ticket.channel !== "instagram") {
        tag = "ACCOUNT_UPDATE";
      }
    }

    console.log("tag", tag)
    // ✅ CORRIGIDO: Processar body com variáveis antes de enviar
    const processedBody = formatBody(body, ticketWithRelations);
    
    let sentMid: string | undefined;
    try {
      const textResult = await sendText(
        number,
        processedBody,
        ticketWithRelations.whatsapp.facebookUserToken,
        tag
      );
      sentMid = textResult?.message_id;
    } catch (sendError: any) {
      const errorCode = sendError?.response?.data?.error?.code;
      const errorMessage = sendError?.response?.data?.error?.message || sendError?.message || "";

      // ✅ NOVO: Fallback para Instagram Private Reply quando DM está fora da janela de 24h
      // O erro 10 / ERR_INSTAGRAM_WINDOW_EXPIRED = janela expirada → tentar Private Reply
      const isWindowExpired = sendError?.message === "ERR_INSTAGRAM_WINDOW_EXPIRED" ||
        errorCode === 10 ||
        errorMessage.includes("período permitido");
      if (ticket.channel === "instagram" && isWindowExpired) {
        console.log(`[INSTAGRAM] ⚠️ DM bloqueada (erro #10) - tentando Private Reply via comment_id`);
        
        // Buscar o wid (commentId) da última mensagem recebida do contato neste ticket
        const lastReceivedMsg = await Message.findOne({
          where: {
            ticketId: ticket.id,
            companyId: ticket.companyId,
            fromMe: false
          },
          order: [["createdAt", "DESC"]],
          limit: 1
        });

        if (lastReceivedMsg?.wid) {
          console.log(`[INSTAGRAM] 🔄 Usando comment_id: ${lastReceivedMsg.wid}`);
          try {
            const result = await sendInstagramPrivateReply(
              lastReceivedMsg.wid,
              processedBody,
              ticketWithRelations.whatsapp.facebookUserToken
            );
            await ticket.update({ lastMessage: processedBody, fromMe: true });
            return { processedBody, mid: result?.message_id };
          } catch (privateReplyError: any) {
            const prCode = privateReplyError?.response?.data?.error?.code;
            const prMessage = privateReplyError?.response?.data?.error?.message || "";
            console.error(`[INSTAGRAM] ❌ Private Reply também falhou (código ${prCode}): ${prMessage}`);
            console.error(`[INSTAGRAM] ℹ️ O Private Reply para comentários do Instagram exige que o comentário tenha no máximo 7 dias.`);
            // Lançar o erro original com mensagem mais amigável
            throw new AppError(`ERR_INSTAGRAM_COMMENT_WINDOW_EXPIRED: A janela de resposta de 7 dias expirou. Responda diretamente nos comentários do Instagram.`);
          }
        } else {
          console.warn(`[INSTAGRAM] ⚠️ Nenhum commentId (wid) encontrado para fallback de Private Reply`);
          throw sendError;
        }
      }

      // Para outros erros, lançar normalmente
      throw sendError;
    }

    // ✅ CORRIGIDO: Atualizar lastMessage com o body processado (variáveis substituídas)
    await ticket.update({ lastMessage: processedBody, fromMe: true });

    return { processedBody, mid: sentMid };

  } catch (err: any) {
    console.error('[FACEBOOK] sendFacebookMessage erro:', err?.message || err);
    throw err instanceof AppError ? err : new AppError(err?.message || 'ERR_SENDING_FACEBOOK_MSG');
  }
};

const sendFacebookMessageWithoutTicket = async ({ body, number, whatsapp }: RequestWithoutTicket): Promise<any> => {
  const { facebookUserToken } = whatsapp;
  try {

    const send = await sendText(
      number,
      body,
      facebookUserToken,
      null
    );

    return send;

  } catch (err: any) {
    console.error('[FACEBOOK] sendFacebookMessageWithoutTicket erro:', err?.message || err);
    throw err instanceof AppError ? err : new AppError(err?.message || 'ERR_SENDING_FACEBOOK_MSG');
  }
};

export { sendFacebookMessage, sendFacebookMessageWithoutTicket };
