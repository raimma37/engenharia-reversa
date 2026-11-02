"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentTestService = exports.AIAgentSummaryService = exports.AIAgentSuggestResponseService = exports.AIAgentRespondService = exports.transcribeAudioBuffer = void 0;
const openai_1 = __importDefault(require("openai"));
const sequelize_1 = require("sequelize");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AIAgentKnowledge_1 = __importDefault(require("../../models/AIAgentKnowledge"));
const Message_1 = __importDefault(require("../../models/Message"));
const logger_1 = __importDefault(require("../../utils/logger"));
// ============================================================
// Transcreve áudio (buffer OGG/MP4) via Whisper
// ============================================================
const transcribeAudioBuffer = async (apiKey, audioBuffer, mimeType = "audio/ogg") => {
    try {
        const openai = new openai_1.default({ apiKey });
        const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("mpeg") ? "mp3" : "ogg";
        const tmpPath = path_1.default.join(require("os").tmpdir(), `aiagent_audio_${Date.now()}.${ext}`);
        fs_1.default.writeFileSync(tmpPath, audioBuffer);
        const transcription = await openai.audio.transcriptions.create({
            file: fs_1.default.createReadStream(tmpPath),
            model: "whisper-1",
            language: "pt",
        });
        fs_1.default.unlinkSync(tmpPath);
        logger_1.default.info(`[AIAgent] Transcrição de áudio: "${transcription.text}"`);
        return transcription.text || null;
    }
    catch (err) {
        logger_1.default.warn("[AIAgent] Falha ao transcrever áudio:", err);
        return null;
    }
};
exports.transcribeAudioBuffer = transcribeAudioBuffer;
// ============================================================
// Custo estimado por modelo (USD por 1M tokens)
// ============================================================
const MODEL_COSTS = {
    "gpt-4o-mini": { input: 0.15, output: 0.60 },
    "gpt-4o": { input: 5.00, output: 15.00 },
    "gpt-4.1-mini": { input: 0.40, output: 1.60 },
    "gpt-4.1": { input: 2.00, output: 8.00 },
    "gpt-4.1-nano": { input: 0.10, output: 0.40 },
    "o4-mini": { input: 1.10, output: 4.40 },
};
// ============================================================
// Monta prompt do sistema a partir da configuração do agente
// ============================================================
function buildSystemPrompt(agent, knowledgeItems) {
    const roleLabels = {
        general: "Assistente Geral",
        sales: "Vendas",
        support: "Suporte Técnico",
        scheduling: "Agendamento",
        financial: "Financeiro",
    };
    const toneLabels = {
        friendly: "amigável e descontraído",
        professional: "profissional e objetivo",
        formal: "formal e respeitoso",
        casual: "casual e informal",
        empathetic: "empático e compreensivo",
        technical: "técnico e preciso",
    };
    let prompt = `Você é um agente de atendimento com a função de ${roleLabels[agent.role] || agent.role}.\n`;
    prompt += `Seja ${toneLabels[agent.voiceTone] || agent.voiceTone} em suas respostas.\n`;
    if (agent.personality) {
        prompt += `\nSua personalidade: ${agent.personality}\n`;
    }
    if (agent.responseRules) {
        prompt += `\nRegras de resposta que você deve seguir:\n${agent.responseRules}\n`;
    }
    const langs = agent.languages ? JSON.parse(agent.languages) : [];
    if (langs.includes("Auto")) {
        prompt += `\nDetecte o idioma usado pelo cliente na última mensagem e responda SEMPRE no mesmo idioma que ele usou. Se não conseguir detectar, use Português (Brasil).\n`;
    }
    else if (langs.length > 0) {
        const langMap = {
            BR: "Português (Brasil)",
            US: "Inglês",
            ES: "Espanhol",
            FR: "Francês",
            DE: "Alemão",
            IT: "Italiano",
        };
        const humanLangs = langs.map(l => langMap[l] || l).join(", ");
        prompt += `\nResponda sempre nos seguintes idiomas: ${humanLangs}.\n`;
    }
    if (agent.maxChars && agent.maxChars > 0) {
        prompt += `\nLimite máximo de caracteres por resposta: ${agent.maxChars}.\n`;
    }
    if (knowledgeItems.length > 0) {
        prompt += `\n--- BASE DE CONHECIMENTO ---\n`;
        knowledgeItems.forEach(item => {
            if (item.type === "file" && item.filePath) {
                prompt += `\n[${item.title || item.type}]: (arquivo disponível para envio - use exatamente este identificador para indicar que quer enviar: [ENVIAR_ARQUIVO:${item.id}])\n`;
            }
            else {
                prompt += `\n[${item.title || item.type}]:\n${item.content || ""}\n`;
            }
        });
        prompt += `--- FIM DA BASE DE CONHECIMENTO ---\n`;
    }
    prompt += `\nResponda de forma direta e útil. Não invente informações que não estão na base de conhecimento.`;
    prompt += `\nIMPORTANTE: Você está respondendo via WhatsApp. NÃO use formatação Markdown. Não use [ ] ou ( ) ao redor de links — escreva apenas a URL diretamente. Não use **negrito**, *itálico* nem outros marcadores Markdown. Escreva texto simples.`;
    return prompt;
}
// ============================================================
// Verifica palavras-chave em uma mensagem
// ============================================================
function checkKeywords(message, keywordsRaw) {
    if (!keywordsRaw)
        return false;
    const keywords = keywordsRaw
        .split(/[,;\n]+/)
        .map(k => k.trim().toLowerCase())
        .filter(Boolean);
    const lower = message.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
}
// Alias para transferência (mantém compat)
const checkTransferKeywords = checkKeywords;
// ============================================================
// Serviço principal — responde a mensagem do ticket via IA
// ============================================================
const AIAgentRespondService = async (agent, ticket, userMessage) => {
    try {
        const openai = new openai_1.default({ apiKey: agent.apiKey });
        // Verifica se usuário pediu encerramento do atendimento
        if (agent.closeTicketEnabled && checkKeywords(userMessage, agent.closeTicketKeywords)) {
            return {
                response: agent.closeTicketMessage || "",
                shouldTransfer: false,
                shouldReturnMenu: false,
                shouldCloseTicket: true,
                fileAttachments: [],
            };
        }
        // Verifica se usuário pediu retorno ao menu inicial
        if (agent.returnMenuEnabled && checkKeywords(userMessage, agent.returnMenuKeywords)) {
            return {
                response: agent.returnMenuMessage || "",
                shouldTransfer: false,
                shouldReturnMenu: true,
                shouldCloseTicket: false,
                fileAttachments: [],
            };
        }
        // Verifica se usuário pediu transferência
        if (agent.allowTransfer && checkTransferKeywords(userMessage, agent.transferKeywords)) {
            return {
                response: agent.transferMessage || "Vou transferir você para um atendente humano.",
                shouldTransfer: true,
                shouldReturnMenu: false,
                shouldCloseTicket: false,
                fileAttachments: [],
            };
        }
        // Carrega base de conhecimento
        const knowledgeItems = await AIAgentKnowledge_1.default.findAll({
            where: { agentId: agent.id },
        });
        // Monta prompt do sistema
        const systemPrompt = buildSystemPrompt(agent, knowledgeItems);
        // Carrega histórico recente de mensagens do ticket
        const maxMessages = agent.maxMessages || 10;
        const pastMessages = await Message_1.default.findAll({
            where: { ticketId: ticket.id, body: { [sequelize_1.Op.ne]: "" } },
            order: [["createdAt", "DESC"]],
            limit: maxMessages,
        });
        pastMessages.reverse();
        // Monta array de mensagens para a API
        const messages = [
            { role: "system", content: systemPrompt },
        ];
        if (agent.initialMessage) {
            messages.push({ role: "assistant", content: agent.initialMessage });
        }
        for (const msg of pastMessages) {
            if (msg.body && msg.body.trim()) {
                messages.push({
                    role: msg.fromMe ? "assistant" : "user",
                    content: msg.body,
                });
            }
        }
        // Garante que a última mensagem do usuário está incluída
        const lastMsgBody = pastMessages[pastMessages.length - 1]?.body;
        if (!lastMsgBody || lastMsgBody !== userMessage) {
            messages.push({ role: "user", content: userMessage });
        }
        // Chama a API
        const completion = await openai.chat.completions.create({
            model: agent.model || "gpt-4o-mini",
            messages,
            temperature: agent.temperature ?? 1,
            max_tokens: agent.maxTokens || 2000,
        });
        const responseText = completion.choices[0]?.message?.content?.trim() || "";
        const usage = completion.usage;
        // Atualiza contadores de tokens no agente
        if (usage) {
            await agent.increment({
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0,
            });
        }
        // Verifica se resposta aciona transferência
        const shouldTransfer = agent.allowTransfer && checkTransferKeywords(responseText, agent.transferKeywords);
        // Detecta pedidos de envio de arquivo na resposta
        const fileAttachments = [];
        const fileRegex = /\[ENVIAR_ARQUIVO:(\d+)\]/g;
        let match;
        const allKnowledge = await AIAgentKnowledge_1.default.findAll({ where: { agentId: agent.id } });
        // Remove Markdown link formatting: [text](url) -> url (or text if text != url)
        let cleanResponse = responseText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
            const isUrl = /^https?:\/\//i.test(text);
            return isUrl ? text : url;
        });
        while ((match = fileRegex.exec(responseText)) !== null) {
            const itemId = Number(match[1]);
            const item = allKnowledge.find(k => k.id === itemId);
            if (item?.filePath) {
                fileAttachments.push({ filePath: item.filePath, title: item.title || "arquivo", mimeType: item.mimeType || "application/octet-stream" });
                cleanResponse = cleanResponse.replace(match[0], "").trim();
            }
        }
        return {
            response: cleanResponse,
            shouldTransfer: shouldTransfer || false,
            shouldReturnMenu: false,
            shouldCloseTicket: false,
            fileAttachments,
        };
    }
    catch (error) {
        logger_1.default.error("[AIAgentOpenAI] Erro ao chamar OpenAI:", error);
        throw error;
    }
};
exports.AIAgentRespondService = AIAgentRespondService;
// ============================================================
// Sugerir resposta para o atendente (NÃO envia automaticamente)
// ============================================================
const AIAgentSuggestResponseService = async (agent, ticketId) => {
    const openai = new openai_1.default({ apiKey: agent.apiKey });
    const pastMessages = await Message_1.default.findAll({
        where: { ticketId, body: { [sequelize_1.Op.ne]: "" } },
        order: [["createdAt", "DESC"]],
        limit: 10,
    });
    pastMessages.reverse();
    const knowledgeItems = await AIAgentKnowledge_1.default.findAll({ where: { agentId: agent.id } });
    const systemPrompt = buildSystemPrompt(agent, knowledgeItems);
    const messages = [
        {
            role: "system",
            content: systemPrompt +
                "\n\nCom base na conversa abaixo, sugira uma resposta adequada para o atendente enviar ao cliente. Seja direto e objetivo.",
        },
    ];
    for (const msg of pastMessages) {
        if (msg.body?.trim()) {
            messages.push({ role: msg.fromMe ? "assistant" : "user", content: msg.body });
        }
    }
    const completion = await openai.chat.completions.create({
        model: agent.model || "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 512,
    });
    const suggestion = completion.choices[0]?.message?.content?.trim() || "";
    if (completion.usage) {
        await agent.increment({
            promptTokens: completion.usage.prompt_tokens || 0,
            completionTokens: completion.usage.completion_tokens || 0,
            totalTokens: completion.usage.total_tokens || 0,
        });
    }
    return suggestion;
};
exports.AIAgentSuggestResponseService = AIAgentSuggestResponseService;
// ============================================================
// Gerar resumo do atendimento (Resumo IA)
// ============================================================
const AIAgentSummaryService = async (agent, ticketId) => {
    const openai = new openai_1.default({ apiKey: agent.apiKey });
    const allMessages = await Message_1.default.findAll({
        where: { ticketId, body: { [sequelize_1.Op.ne]: "" } },
        order: [["createdAt", "ASC"]],
        limit: 100,
    });
    if (allMessages.length === 0) {
        return "Nenhuma mensagem encontrada para este atendimento.";
    }
    const conversation = allMessages
        .map(m => `${m.fromMe ? "Atendente" : "Cliente"}: ${m.body}`)
        .join("\n");
    const prompt = `Faça um resumo objetivo e conciso desta conversa de atendimento ao cliente:\n\n${conversation}\n\nInclua:\n- Assunto principal\n- Pontos discutidos\n- Resultado/resolução (se houver)`;
    const completion = await openai.chat.completions.create({
        model: agent.model || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
    });
    const summary = completion.choices[0]?.message?.content?.trim() || "";
    if (completion.usage) {
        await agent.increment({
            promptTokens: completion.usage.prompt_tokens || 0,
            completionTokens: completion.usage.completion_tokens || 0,
            totalTokens: completion.usage.total_tokens || 0,
        });
    }
    return summary;
};
exports.AIAgentSummaryService = AIAgentSummaryService;
// ============================================================
// Testar agente no modal (sem ticket real)
// ============================================================
const AIAgentTestService = async (agent, messages) => {
    const openai = new openai_1.default({ apiKey: agent.apiKey });
    const knowledgeItems = agent.id
        ? await AIAgentKnowledge_1.default.findAll({ where: { agentId: agent.id } })
        : [];
    const systemPrompt = buildSystemPrompt(agent, knowledgeItems);
    const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
    ];
    const completion = await openai.chat.completions.create({
        model: agent.model || "gpt-4o-mini",
        messages: apiMessages,
        temperature: agent.temperature ?? 1,
        max_tokens: agent.maxTokens || 2000,
    });
    return completion.choices[0]?.message?.content?.trim() || "";
};
exports.AIAgentTestService = AIAgentTestService;
