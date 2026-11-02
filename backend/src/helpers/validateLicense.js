// Middleware de validação de licença (ambiente local)
console.log('[LICENÇA] ✅ Ambiente local/desenvolvimento ativo');

const licencaMiddleware = (req, res, next) => {
  next();
};

async function iniciarMonitoramento() {
  console.log('[LICENÇA] ✅ Monitoramento local ativo');
  return true;
}

async function validarLicenca() {
  return true;
}

function statusLicenca() {
  return {
    valida: true,
    ultimaVerificacao: new Date().toISOString(),
    inicializacaoConcluida: true,
  };
}

module.exports = {
  iniciarMonitoramento,
  licencaMiddleware,
  validarLicenca,
  statusLicenca,
};
