import { Router } from "express";
import * as WahaCompatController from "../controllers/WahaCompatController";

const wahaCompatRoutes = Router();

// Rotas compatíveis com WAHA (usadas pelos fluxos n8n do print-shop-budget-system)
wahaCompatRoutes.post("/api/sendText", WahaCompatController.sendText);
wahaCompatRoutes.post("/api/sendFile", WahaCompatController.sendFile);
wahaCompatRoutes.post("/api/sendSeen", WahaCompatController.sendSeen);
wahaCompatRoutes.post("/api/startTyping", WahaCompatController.startTyping);
wahaCompatRoutes.get("/api/contacts/check-exists", WahaCompatController.checkExists);
wahaCompatRoutes.get("/api/:session/chats/:chatId/messages/:messageId", WahaCompatController.getMessageStatus);

// Rotas equivalentes sob /api/messages/* (padrão nativo Whaticket estendido para JSON Base64)
wahaCompatRoutes.post("/api/messages/sendText", WahaCompatController.sendText);
wahaCompatRoutes.post("/api/messages/send/base64", WahaCompatController.sendFile);

export default wahaCompatRoutes;
