import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Request {
  key: string;
  value: string;
  companyId: number;
}

const UpdateSettingService = async ({
  key,
  value,
  companyId
}: Request): Promise<Setting | undefined> => {
  console.log(`💾 [UpdateSettingService] Salvando configuração: ${key} para companyId: ${companyId}`);

  const valueToSave =
    Array.isArray(value) || typeof value === "object"
      ? JSON.stringify(value)
      : value;

  const [setting] = await Setting.findOrCreate({
    where: {
      key,
      companyId
    },
    defaults: {
      key,
      value: valueToSave,
      companyId
    }
  });

  if (setting != null && setting?.companyId !== companyId) {
    throw new AppError("Não é possível consultar registros de outra empresa");
  }

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  await setting.update({ value: valueToSave });

  console.log(`✅ [UpdateSettingService] Configuração ${key} salva com sucesso para companyId: ${companyId}`);

  return setting;
};

export default UpdateSettingService;
