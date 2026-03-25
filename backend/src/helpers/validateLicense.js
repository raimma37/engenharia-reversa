/**
 * validateLicense.js
 * ============================================================
 * Módulo de proteção de licença para integração com Whaticket
 *
 * COMO USAR no backend do Whaticket:
 *
 *   1. Copie este arquivo para: src/helpers/validateLicense.js
 *
 *   2. No app.ts / app.js, adicione:
 *      const { iniciarMonitoramento, licencaMiddleware } = require('./helpers/validateLicense');
 *      iniciarMonitoramento(); // chama na inicialização
 *      app.use(licencaMiddleware); // antes das suas rotas
 *
 *   3. Configure no .env do Whaticket:
 *      LICENSE_KEY=seu-token-uuid-aqui
 *      LICENSE_SERVER=https://seu-painel.com
 *      BACKEND_URL=https://api.seucliente.com
 * ============================================================
 */

const axios = require('axios');

// ----- Configuração -----
const LICENSE_SERVER = process.env.LICENSE_SERVER;
const LICENSE_KEY = process.env.LICENSE_KEY;
const BACKEND_URL = process.env.BACKEND_URL;

// Intervalo de verificação padrão: 30 minutos
const DEFAULT_INTERVAL_MIN = 30;

// Tempo máximo sem conseguir validar antes de encerrar: 1 hora
const MAX_OFFLINE_MS = 60 * 60 * 1000;

// ----- Estado interno -----
let licencaValida = false;         // começa inválida até primeira verificação
let ultimaVerificacaoOk = null;    // timestamp da última validação bem-sucedida
let inicializacaoConcluida = false;
let tentativasIniciais = 0;
const MAX_TENTATIVAS_INICIAIS = 3;

/**
 * Obtém o IP público do servidor
 */
async function obterIpPublico() {
    const fontes = [
        'https://api.ipify.org?format=json',
        'https://api4.my-ip.io/ip.json',
        'https://ipinfo.io/json',
    ];

    for (const url of fontes) {
        try {
            const { data } = await axios.get(url, { timeout: 5000 });
            const ip = data.ip || data.myip;
            if (ip) return ip;
        } catch (_) {
            // Tentar próxima fonte
        }
    }

    console.warn('[LICENÇA] Não foi possível determinar IP público. Usando 0.0.0.0');
    return '0.0.0.0';
}

/**
 * Realiza a validação junto ao servidor do painel
 * @returns {Promise<boolean>}
 */
async function validarLicenca() {
    if (!LICENSE_KEY || !LICENSE_SERVER || !BACKEND_URL) {
        console.error('[LICENÇA] ❌ Configuração incompleta: LICENSE_KEY, LICENSE_SERVER e BACKEND_URL são necessários');
        return false;
    }

    try {
        const ip = await obterIpPublico();

        // Extrair apenas o hostname sem protocolo
        const dominio = BACKEND_URL
            .replace(/^https?:\/\//, '')
            .split('/')[0];

        const { data } = await axios.post(
            `${LICENSE_SERVER}/api/licencas/validar`,
            { token: LICENSE_KEY, dominio, ip },
            {
                timeout: 15000,
                headers: { 'Content-Type': 'application/json' },
            }
        );

        if (data.valido) {
            ultimaVerificacaoOk = Date.now();
            licencaValida = true;
            console.log(`[LICENÇA] ✅ Válida — Cliente: ${data.cliente}`);
            return true;
        } else {
            licencaValida = false;
            console.error(`[LICENÇA] ❌ Inválida: ${data.motivo}`);
            return false;
        }
    } catch (err) {
        console.error(`[LICENÇA] ⚠️ Erro na validação: ${err.message}`);

        // Se nunca validou com sucesso, marca como inválida
        if (!ultimaVerificacaoOk) {
            return false;
        }

        // Se validou antes mas está sem conexão, verifica timeout
        const tempoOffline = Date.now() - ultimaVerificacaoOk;
        if (tempoOffline > MAX_OFFLINE_MS) {
            console.error(`[LICENÇA] ❌ Servidor inacessível por ${Math.round(tempoOffline / 60000)} minutos. Encerrando...`);
            licencaValida = false;
            return false;
        }

        // Tolerância: mantém como válida enquanto dentro do prazo
        console.warn(`[LICENÇA] ⏱️ Servidor inacessível. Tolerância: ${Math.round((MAX_OFFLINE_MS - tempoOffline) / 60000)} min restantes`);
        return true; // mantem valid temporariamente
    }
}

/**
 * Inicia o monitoramento periódico da licença
 *
 * @param {number} intervaloMinutos - Intervalo em minutos (padrão: 30)
 */
async function iniciarMonitoramento(intervaloMinutos = DEFAULT_INTERVAL_MIN) {
    console.log(`[LICENÇA] 🔐 Iniciando validação de licença...`);
    console.log(`[LICENÇA] Servidor: ${LICENSE_SERVER}`);
    console.log(`[LICENÇA] Intervalo: ${intervaloMinutos} minutos`);

    // Tentar validar imediatamente (com retry)
    for (let i = 0; i < MAX_TENTATIVAS_INICIAIS; i++) {
        const valido = await validarLicenca();
        if (valido) {
            inicializacaoConcluida = true;
            break;
        }

        tentativasIniciais++;
        if (i < MAX_TENTATIVAS_INICIAIS - 1) {
            console.warn(`[LICENÇA] Tentativa ${i + 1}/${MAX_TENTATIVAS_INICIAIS} falhou. Aguardando 30s...`);
            await new Promise((r) => setTimeout(r, 30000));
        }
    }

    if (!licencaValida) {
        console.error('[LICENÇA] ❌ Licença inválida. Encerrando aplicação em 60 segundos...');
        setTimeout(() => {
            console.error('[LICENÇA] Encerrando por licença inválida.');
            process.exit(1);
        }, 60000);
        return;
    }

    inicializacaoConcluida = true;

    // Monitoramento periódico
    const intervaloMs = intervaloMinutos * 60 * 1000;
    setInterval(async () => {
        const valido = await validarLicenca();

        if (!valido) {
            console.error('[LICENÇA] ❌ Licença inválida detectada. Sistema será encerrado em 5 minutos...');
            // Aguarda 5 minutos para evitar derrubada por falha temporária de rede
            setTimeout(() => {
                // Verifica novamente antes de encerrar
                if (!licencaValida) {
                    console.error('[LICENÇA] Encerrando aplicação por licença inválida.');
                    process.exit(1);
                }
            }, 5 * 60 * 1000);
        }
    }, intervaloMs);

    console.log(`[LICENÇA] ✅ Monitoramento ativo — próxima verificação em ${intervaloMinutos} minutos`);
}

/**
 * Middleware Express — rejeita requisições se a licença for inválida
 * Adicione ANTES das rotas da sua API:
 *   app.use(licencaMiddleware);
 */
function licencaMiddleware(req, res, next) {
    // Permitir health check independente de licença
    if (req.path === '/health' || req.path === '/ping') {
        return next();
    }

    // Aguardar inicialização da primeira verificação
    if (!inicializacaoConcluida) {
        return res.status(503).json({
            error: 'Sistema inicializando. Tente novamente em instantes.',
        });
    }

    if (!licencaValida) {
        return res.status(503).json({
            error: 'Licença inválida ou expirada. Entre em contato com o suporte.',
            contact: process.env.SUPPORT_EMAIL || 'suporte@seupainel.com',
        });
    }

    next();
}

/**
 * Retorna o estado atual da licença (para debug/monitoramento interno)
 */
function statusLicenca() {
    return {
        valida: licencaValida,
        ultimaVerificacao: ultimaVerificacaoOk ? new Date(ultimaVerificacaoOk).toISOString() : null,
        inicializacaoConcluida,
    };
}

module.exports = {
    iniciarMonitoramento,
    licencaMiddleware,
    validarLicenca,
    statusLicenca,
};
