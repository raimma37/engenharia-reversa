import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { handleMessage, handleChange } from "../services/FacebookServices/facebookMessageListener";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
  }

  return res.status(403).json({
    message: "Forbidden"
  });
};

export const webHook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { body } = req;
    
    if (body.object === "page" || body.object === "instagram") {
      const channel = body.object === "page" ? "facebook" : "instagram";

      body.entry?.forEach(async (entry: any) => {
        console.log(`[WEBHOOK] 🔍 Processando entry.id: ${entry.id}, channel: ${channel}`);
        console.log(`[WEBHOOK] 📋 Estrutura completa do entry:`, JSON.stringify(entry, null, 2));

        // ✅ CORRIGIDO: Busca mais robusta para conexões Instagram/Facebook
        let getTokenPage = await Whatsapp.findOne({
          where: {
            facebookPageUserId: entry.id,
            channel
          }
        });

        // ✅ NOVO: Se não encontrou a conexão direta, tentar buscar de outras formas
        if (!getTokenPage && channel === "facebook") {
          console.log(`[WEBHOOK] 🔍 Tentando buscar conexão Facebook de forma alternativa para entry.id: ${entry.id}`);
          
          const allFacebookConnections = await Whatsapp.findAll({
            where: {
              channel: "facebook",
              status: "CONNECTED"
            }
          });

          console.log(`[WEBHOOK] 📊 Total de conexões Facebook encontradas: ${allFacebookConnections.length}`);
          allFacebookConnections.forEach(conn => {
            console.log(`[WEBHOOK] 📋 FB Conexão ID: ${conn.id}, facebookPageUserId: ${conn.facebookPageUserId}, nome: ${conn.name}`);
          });

          if (allFacebookConnections.length === 1) {
            getTokenPage = allFacebookConnections[0];
            console.log(`[WEBHOOK] ✅ Usando conexão Facebook única: ID ${getTokenPage.id}`);
          }
        }

        if (!getTokenPage && channel === "instagram") {
          console.log(`[WEBHOOK] 🔍 Tentando buscar conexão Instagram de forma alternativa para entry.id: ${entry.id}`);
          
          // Tentar buscar por qualquer conexão Instagram na mesma empresa
          const allInstagramConnections = await Whatsapp.findAll({
            where: {
              channel: "instagram",
              status: "CONNECTED"
            }
          });

          console.log(`[WEBHOOK] 📊 Total de conexões Instagram encontradas: ${allInstagramConnections.length}`);
          allInstagramConnections.forEach(conn => {
            console.log(`[WEBHOOK] 📋 Conexão ID: ${conn.id}, facebookPageUserId: ${conn.facebookPageUserId}, nome: ${conn.name}`);
          });

          // ✅ NOVO: Se há apenas uma conexão Instagram, usar ela (caso comum)
          if (allInstagramConnections.length === 1) {
            getTokenPage = allInstagramConnections[0];
            console.log(`[WEBHOOK] ✅ Usando conexão Instagram única: ID ${getTokenPage.id}`);
          }
          
          // ✅ NOVO: Também tentar buscar pela página Facebook vinculada
          if (!getTokenPage) {
            const facebookPage = await Whatsapp.findOne({
              where: {
                channel: "facebook",
                status: "CONNECTED"
              }
            });
            
            if (facebookPage) {
              console.log(`[WEBHOOK] 🔗 Tentando usar página Facebook vinculada: ${facebookPage.facebookPageUserId}`);
              // Buscar se há Instagram vinculado a esta página
              const linkedInstagram = await Whatsapp.findOne({
                where: {
                  channel: "instagram",
                  companyId: facebookPage.companyId,
                  status: "CONNECTED"
                }
              });
              
              if (linkedInstagram) {
                getTokenPage = linkedInstagram;
                console.log(`[WEBHOOK] ✅ Usando Instagram vinculado à página FB: ID ${getTokenPage.id}`);
              }
            }
          }
        }

        if (getTokenPage) {
          console.log(`[WEBHOOK] ✅ Conexão encontrada - ID: ${getTokenPage.id}, Nome: ${getTokenPage.name}, Channel: ${getTokenPage.channel}`);
          
          entry.messaging?.forEach((data: any) => {
            // Ignorar eventos sem mensagem e sem reação (ex: message_edit)
            if (!data.message && !data.reaction) return;
            handleMessage(getTokenPage, data, channel, getTokenPage.companyId).catch(err => {
              console.error('[WEBHOOK] Erro ao processar handleMessage:', err?.message || err);
            });
          });

          entry.changes?.forEach((change: any) => {
            console.log(`[WEBHOOK] 📝 Processando change: field="${change.field}", channel="${channel}"`);
            handleChange(getTokenPage, change, channel, getTokenPage.companyId);
          });

          // Para Instagram, suporte a comentários diretos no entry (fora de changes)
          if (channel === "instagram" && entry.comments) {
            console.log(`[WEBHOOK] 📝 Processando comentários diretos do Instagram`);
            handleChange(getTokenPage, { field: "comments", value: entry.comments }, channel, getTokenPage.companyId);
          }
          if (channel === "instagram" && entry.comment) {
            console.log(`[WEBHOOK] 📝 Processando comentário singular do Instagram`);
            handleChange(getTokenPage, { field: "comment", value: entry.comment }, channel, getTokenPage.companyId);
          }
        } else {
          // ✅ MELHORADO: Log mais detalhado quando não encontrar conexão
          console.warn(`[WEBHOOK] ❌ Nenhuma conexão encontrada para entry.id: ${entry.id}, channel: ${channel}`);
          console.warn(`[WEBHOOK] 📋 Dados do entry:`, JSON.stringify(entry, null, 2));
          
          // Listar conexões disponíveis para debug
          const availableConnections = await Whatsapp.findAll({
            where: { channel },
            attributes: ['id', 'name', 'facebookPageUserId', 'status', 'companyId']
          });
          console.warn(`[WEBHOOK] 📊 Conexões ${channel} disponíveis:`, availableConnections.map(c => ({
            id: c.id,
            name: c.name,
            facebookPageUserId: c.facebookPageUserId,
            status: c.status,
            companyId: c.companyId
          })));
        }
      });

      return res.status(200).json({
        message: "EVENT_RECEIVED"
      });
    }

    return res.status(404).json({
      message: body
    });
  } catch (error) {
    return res.status(500).json({
      message: error
    });
  }
};