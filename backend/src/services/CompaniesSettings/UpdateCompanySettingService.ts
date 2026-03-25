/** 
 * @TercioSantos-0 |
 * serviço/atualizar 1 configuração da empresa |
 * @params:companyId/column(name)/data
 */
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import { invalidateCompanySettingsCache } from "../WbotServices/wbotMessageListener";

type Params = {
  companyId: number,
  column:string,
  data:string
};

const UpdateCompanySettingsService = async ({companyId, column, data}:Params): Promise<any> => {

  const [results, metadata] = await sequelize.query(`UPDATE "CompaniesSettings" SET "${column}"='${data}' WHERE "companyId"=${companyId}`)

  // ✅ Invalidar cache de settings quando configurações são atualizadas
  invalidateCompanySettingsCache(companyId);

  return results;
};

export default UpdateCompanySettingsService;