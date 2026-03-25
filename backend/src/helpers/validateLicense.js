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

// Intervalo de verificação padrão: 5 minutos
const DEFAULT_INTERVAL_MIN = 5;

// Tempo máximo sem conseguir validar antes de encerrar: 1 hora
const MAX_OFFLINE_MS = 60 * 60 * 1000;

// ----- Estado interno -----
let licencaValida = false;             // começa inválida até primeira verificação
let licencaBloqueadaExplicitamente = false; // true = painel respondeu BLOQUEADA (não é erro de rede)
let ultimaVerificacaoOk = null;        // timestamp da última validação bem-sucedida
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
            licencaBloqueadaExplicitamente = false;
            console.log(`[LICENÇA] ✅ Válida — Cliente: ${data.cliente}`);
            return true;
        } else {
            licencaValida = false;
            // Bloqueio explícito pelo painel (não é falha de rede)
            licencaBloqueadaExplicitamente = true;
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
    // Nunca usar intervalo maior que o padrão definido aqui (ignora valor hardcoded do app.js)
    if (intervaloMinutos > DEFAULT_INTERVAL_MIN) {
        intervaloMinutos = DEFAULT_INTERVAL_MIN;
    }
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

        // Se foi bloqueio explícito pelo painel, não adianta tentar novamente imediatamente
        if (licencaBloqueadaExplicitamente) {
            console.warn('[LICENÇA] ⛔ Licença bloqueada. Sistema em modo de espera — verificando a cada 5 minutos...');
            break;
        }

        if (i < MAX_TENTATIVAS_INICIAIS - 1) {
            console.warn(`[LICENÇA] Tentativa ${i + 1}/${MAX_TENTATIVAS_INICIAIS} falhou. Aguardando 30s...`);
            await new Promise((r) => setTimeout(r, 30000));
        }
    }

    // Licença bloqueada explicitamente: mantém processo vivo, retorna 503
    // Quando o painel reativar, o próximo ciclo detecta e libera automaticamente
    if (licencaBloqueadaExplicitamente) {
        inicializacaoConcluida = true; // sai do modo "inicializando"
        // licencaValida permanece false → middleware retorna 503
    } else if (!licencaValida) {
        // Problema de rede ou configuração → encerra para forçar revisão
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
            if (licencaBloqueadaExplicitamente) {
                // Bloqueio explícito: mantém processo vivo retornando 503
                // Recupera automaticamente quando o painel reativar a licença
                console.error('[LICENÇA] 🚫 Licença BLOQUEADA. Próxima verificação em 5 minutos...');
            } else {
                // Pode ser falha de rede temporária — aguarda 5 minutos e verifica novamente
                console.error('[LICENÇA] ❌ Licença inválida detectada. Sistema será encerrado em 5 minutos...');
                setTimeout(() => {
                    if (!licencaValida) {
                        console.error('[LICENÇA] Encerrando aplicação por licença inválida.');
                        process.exit(1);
                    }
                }, 5 * 60 * 1000);
            }
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
