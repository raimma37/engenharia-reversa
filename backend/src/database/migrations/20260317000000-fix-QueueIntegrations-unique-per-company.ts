import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize as any;

    // Remove unique constraint global em 'name'
    await sequelize.query(
      `ALTER TABLE "QueueIntegrations" DROP CONSTRAINT IF EXISTS "QueueIntegrations_name_key";`
    );

    // Remove unique constraint global em 'projectName' (se existir)
    await sequelize.query(
      `ALTER TABLE "QueueIntegrations" DROP CONSTRAINT IF EXISTS "QueueIntegrations_projectName_key";`
    );

    // Adiciona unique composto: name + companyId
    await sequelize.query(
      `ALTER TABLE "QueueIntegrations" ADD CONSTRAINT "QueueIntegrations_name_companyId_unique" UNIQUE ("name", "companyId");`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize as any;

    await sequelize.query(
      `ALTER TABLE "QueueIntegrations" DROP CONSTRAINT IF EXISTS "QueueIntegrations_name_companyId_unique";`
    );

    await sequelize.query(
      `ALTER TABLE "QueueIntegrations" ADD CONSTRAINT "QueueIntegrations_name_key" UNIQUE ("name");`
    );
  }
};
