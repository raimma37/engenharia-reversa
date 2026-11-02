"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAgentMetricsService = exports.DeleteAgentService = exports.UpdateAgentService = exports.CreateAgentService = exports.ShowAgentService = exports.ListAgentsService = void 0;
const AIAgent_1 = __importDefault(require("../../models/AIAgent"));
const AIAgentKnowledge_1 = __importDefault(require("../../models/AIAgentKnowledge"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ListAgentsService = async (companyId) => {
    const agents = await AIAgent_1.default.findAll({
        where: { companyId },
        include: [{ model: Queue_1.default, as: "queue", attributes: ["id", "name"] }],
        order: [["createdAt", "DESC"]],
    });
    return agents;
};
exports.ListAgentsService = ListAgentsService;
const ShowAgentService = async (id, companyId) => {
    const agent = await AIAgent_1.default.findOne({
        where: { id, companyId },
        include: [
            { model: Queue_1.default, as: "queue", attributes: ["id", "name"] },
            { model: AIAgentKnowledge_1.default, as: "knowledgeItems" },
        ],
    });
    if (!agent)
        throw new AppError_1.default("Agente de IA não encontrado", 404);
    return agent;
};
exports.ShowAgentService = ShowAgentService;
const CreateAgentService = async (data) => {
    const agent = await AIAgent_1.default.create(data);
    return agent;
};
exports.CreateAgentService = CreateAgentService;
const UpdateAgentService = async (id, companyId, data) => {
    const agent = await AIAgent_1.default.findOne({ where: { id, companyId } });
    if (!agent)
        throw new AppError_1.default("Agente de IA não encontrado", 404);
    await agent.update(data);
    return agent.reload({ include: [{ model: Queue_1.default, as: "queue", attributes: ["id", "name"] }] });
};
exports.UpdateAgentService = UpdateAgentService;
const DeleteAgentService = async (id, companyId) => {
    const agent = await AIAgent_1.default.findOne({ where: { id, companyId } });
    if (!agent)
        throw new AppError_1.default("Agente de IA não encontrado", 404);
    await agent.destroy();
};
exports.DeleteAgentService = DeleteAgentService;
const GetAgentMetricsService = async (companyId) => {
    const agents = await AIAgent_1.default.findAll({ where: { companyId } });
    const totalPromptTokens = agents.reduce((sum, a) => sum + (a.promptTokens || 0), 0);
    const totalCompletionTokens = agents.reduce((sum, a) => sum + (a.completionTokens || 0), 0);
    const totalTokens = agents.reduce((sum, a) => sum + (a.totalTokens || 0), 0);
    // Custo estimado em USD — GPT-4o-mini: $0.15/1M input + $0.60/1M output
    const estimatedCost = (totalPromptTokens / 1000000) * 0.15 + (totalCompletionTokens / 1000000) * 0.60;
    return { totalTokens, promptTokens: totalPromptTokens, completionTokens: totalCompletionTokens, estimatedCost };
};
exports.GetAgentMetricsService = GetAgentMetricsService;
