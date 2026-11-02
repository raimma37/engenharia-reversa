"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const upload_1 = __importDefault(require("../config/upload"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const AIAgentController = __importStar(require("../controllers/AIAgentController"));
const aiAgentRoutes = express_1.default.Router();
const upload = (0, multer_1.default)(upload_1.default);
// Métricas
aiAgentRoutes.get("/ai-agents/metrics", isAuth_1.default, AIAgentController.metrics);
// CRUD agentes
aiAgentRoutes.get("/ai-agents", isAuth_1.default, AIAgentController.index);
aiAgentRoutes.get("/ai-agents/:id", isAuth_1.default, AIAgentController.show);
aiAgentRoutes.post("/ai-agents", isAuth_1.default, AIAgentController.store);
aiAgentRoutes.put("/ai-agents/:id", isAuth_1.default, AIAgentController.update);
aiAgentRoutes.delete("/ai-agents/:id", isAuth_1.default, AIAgentController.remove);
// Base de conhecimento
aiAgentRoutes.post("/ai-agents/:id/knowledge", isAuth_1.default, AIAgentController.addKnowledge);
aiAgentRoutes.post("/ai-agents/:id/knowledge/upload", isAuth_1.default, upload.single("file"), AIAgentController.addKnowledgeFile);
aiAgentRoutes.put("/ai-agents/:id/knowledge/:kid", isAuth_1.default, AIAgentController.updateKnowledge);
aiAgentRoutes.delete("/ai-agents/:id/knowledge/:kid", isAuth_1.default, AIAgentController.removeKnowledge);
// Ações complementares
aiAgentRoutes.post("/ai-agent/suggest-response/:ticketId", isAuth_1.default, AIAgentController.suggestResponse);
aiAgentRoutes.post("/ai-agent/summary/:ticketId", isAuth_1.default, AIAgentController.summary);
aiAgentRoutes.post("/ai-agent/test", isAuth_1.default, AIAgentController.testAgent);
exports.default = aiAgentRoutes;
