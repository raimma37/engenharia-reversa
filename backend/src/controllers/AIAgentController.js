"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAgent = exports.summary = exports.suggestResponse = exports.removeKnowledge = exports.updateKnowledge = exports.addKnowledgeFile = exports.addKnowledge = exports.remove = exports.update = exports.store = exports.show = exports.metrics = exports.index = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = __importDefault(require("../config/auth"));
const AIAgentCRUDService_1 = require("../services/AIAgentServices/AIAgentCRUDService");
const AIAgentOpenAIService_1 = require("../services/AIAgentServices/AIAgentOpenAIService");
const AIAgent_1 = __importDefault(require("../models/AIAgent"));
const AIAgentKnowledge_1 = __importDefault(require("../models/AIAgentKnowledge"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const socket_1 = require("../libs/socket");
const getCompanyId = (req) => {
    const [, token] = req.headers.authorization.split(" ");
    const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
    return decoded.companyId;
};
// GET /ai-agents
const index = async (req, res) => {
    const companyId = getCompanyId(req);
    const agents = await (0, AIAgentCRUDService_1.ListAgentsService)(companyId);
    return res.json(agents);
};
exports.index = index;
// GET /ai-agents/metrics
const metrics = async (req, res) => {
    const companyId = getCompanyId(req);
    const data = await (0, AIAgentCRUDService_1.GetAgentMetricsService)(companyId);
    return res.json(data);
};
exports.metrics = metrics;
// GET /ai-agents/:id
const show = async (req, res) => {
    const companyId = getCompanyId(req);
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        throw new AppError_1.default("ID inválido", 400);
    const agent = await (0, AIAgentCRUDService_1.ShowAgentService)(id, companyId);
    return res.json(agent);
};
exports.show = show;
// POST /ai-agents
const store = async (req, res) => {
    const companyId = getCompanyId(req);
    const data = { ...req.body, companyId };
    const agent = await (0, AIAgentCRUDService_1.CreateAgentService)(data);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-aiagent`, {
        action: "create",
        agent,
    });
    return res.status(201).json(agent);
};
exports.store = store;
// PUT /ai-agents/:id
const update = async (req, res) => {
    const companyId = getCompanyId(req);
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        throw new AppError_1.default("ID inválido", 400);
    const agent = await (0, AIAgentCRUDService_1.UpdateAgentService)(id, companyId, req.body);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-aiagent`, {
        action: "update",
        agent,
    });
    return res.json(agent);
};
exports.update = update;
// DELETE /ai-agents/:id
const remove = async (req, res) => {
    const companyId = getCompanyId(req);
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        throw new AppError_1.default("ID inválido", 400);
    await (0, AIAgentCRUDService_1.DeleteAgentService)(id, companyId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId)).emit(`company-${companyId}-aiagent`, {
        action: "delete",
        id,
    });
    return res.status(200).json({ message: "Agente removido" });
};
exports.remove = remove;
// POST /ai-agents/:id/knowledge
const addKnowledge = async (req, res) => {
    const companyId = getCompanyId(req);
    const agentId = Number(req.params.id);
    const agent = await AIAgent_1.default.findOne({ where: { id: agentId, companyId } });
    if (!agent)
        throw new AppError_1.default("Agente não encontrado", 404);
    const { type, title, content, filePath, mimeType } = req.body;
    const item = await AIAgentKnowledge_1.default.create({ type, title, content, filePath, mimeType, agentId, companyId });
    return res.status(201).json(item);
};
exports.addKnowledge = addKnowledge;
// POST /ai-agents/:id/knowledge/upload  (multipart/form-data)
const addKnowledgeFile = async (req, res) => {
    const companyId = getCompanyId(req);
    const agentId = Number(req.params.id);
    const agent = await AIAgent_1.default.findOne({ where: { id: agentId, companyId } });
    if (!agent)
        throw new AppError_1.default("Agente não encontrado", 404);
    const file = req.file;
    if (!file)
        throw new AppError_1.default("Nenhum arquivo enviado", 400);
    const { title } = req.body;
    const filePath = `/public/company${companyId}/aiknowledge/${file.filename}`;
    const item = await AIAgentKnowledge_1.default.create({
        type: "file",
        title: title || file.originalname,
        content: file.originalname,
        filePath,
        mimeType: file.mimetype,
        agentId,
        companyId,
    });
    return res.status(201).json(item);
};
exports.addKnowledgeFile = addKnowledgeFile;
// PUT /ai-agents/:id/knowledge/:kid
const updateKnowledge = async (req, res) => {
    const companyId = getCompanyId(req);
    const agentId = Number(req.params.id);
    const kid = Number(req.params.kid);
    const item = await AIAgentKnowledge_1.default.findOne({ where: { id: kid, agentId, companyId } });
    if (!item)
        throw new AppError_1.default("Item de conhecimento não encontrado", 404);
    const { title, content } = req.body;
    await item.update({ title, content });
    return res.status(200).json(item);
};
exports.updateKnowledge = updateKnowledge;
// DELETE /ai-agents/:id/knowledge/:kid
const removeKnowledge = async (req, res) => {
    const companyId = getCompanyId(req);
    const agentId = Number(req.params.id);
    const kid = Number(req.params.kid);
    const item = await AIAgentKnowledge_1.default.findOne({ where: { id: kid, agentId, companyId } });
    if (!item)
        throw new AppError_1.default("Item de conhecimento não encontrado", 404);
    await item.destroy();
    return res.status(200).json({ message: "Removido" });
};
exports.removeKnowledge = removeKnowledge;
// POST /ai-agent/suggest-response/:ticketId
const suggestResponse = async (req, res) => {
    const companyId = getCompanyId(req);
    const ticketId = Number(req.params.ticketId);
    const { agentId } = req.body;
    let agent = null;
    if (agentId) {
        agent = await AIAgent_1.default.findOne({ where: { id: agentId, companyId } });
    }
    else {
        // Pega primeiro agente ativo da empresa
        agent = await AIAgent_1.default.findOne({ where: { companyId, isActive: true } });
    }
    if (!agent)
        throw new AppError_1.default("Nenhum agente ativo encontrado", 404);
    const suggestion = await (0, AIAgentOpenAIService_1.AIAgentSuggestResponseService)(agent, ticketId);
    return res.json({ suggestion });
};
exports.suggestResponse = suggestResponse;
// POST /ai-agent/summary/:ticketId
const summary = async (req, res) => {
    const companyId = getCompanyId(req);
    const ticketId = Number(req.params.ticketId);
    const { agentId } = req.body;
    let agent = null;
    if (agentId) {
        agent = await AIAgent_1.default.findOne({ where: { id: agentId, companyId } });
    }
    else {
        agent = await AIAgent_1.default.findOne({ where: { companyId, isActive: true } });
    }
    if (!agent)
        throw new AppError_1.default("Nenhum agente ativo encontrado", 404);
    const ticket = await Ticket_1.default.findByPk(ticketId);
    if (!ticket || ticket.companyId !== companyId)
        throw new AppError_1.default("Ticket não encontrado", 404);
    const text = await (0, AIAgentOpenAIService_1.AIAgentSummaryService)(agent, ticketId);
    return res.json({ summary: text });
};
exports.summary = summary;
// POST /ai-agent/test
const testAgent = async (req, res) => {
    const { agentConfig, messages } = req.body;
    const companyId = getCompanyId(req);
    // Se tiver agentId, carrega do banco; senão usa config enviada no body
    let agentData = agentConfig;
    if (agentConfig?.id) {
        const dbAgent = await AIAgent_1.default.findOne({ where: { id: agentConfig.id, companyId } });
        if (dbAgent)
            agentData = dbAgent;
    }
    const response = await (0, AIAgentOpenAIService_1.AIAgentTestService)(agentData, messages || []);
    return res.json({ response });
};
exports.testAgent = testAgent;
