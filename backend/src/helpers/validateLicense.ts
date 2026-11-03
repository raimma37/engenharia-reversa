// Middleware de validação de licença (ambiente local)
console.log('[LICENÇA] ✅ Ambiente local/desenvolvimento ativo');

export const licencaMiddleware = (req: any, res: any, next: any) => {
  next();
};

export async function iniciarMonitoramento(): Promise<boolean> {
  console.log('[LICENÇA] ✅ Monitoramento local ativo');
  return true;
}

export async function validarLicenca(): Promise<boolean> {
  return true;
}

export function statusLicenca() {
  return {
    valida: true,
    ultimaVerificacao: new Date().toISOString(),
    inicializacaoConcluida: true,
  };
}

export default {
  iniciarMonitoramento,
  licencaMiddleware,
  validarLicenca,
  statusLicenca,
};
