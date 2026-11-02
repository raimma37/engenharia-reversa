import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async t => {
      const versionExists = await queryInterface.rawSelect(
        "Versions",
        {
          where: { id: 1 }
        },
        ["id"]
      );
      if (!versionExists) {
        await queryInterface.bulkInsert(
          "Versions",
          [
            {
              id: 1,
              versionFrontend: "5.5.4",
              versionBackend: "5.5",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          { transaction: t }
        );
      }
      await queryInterface.sequelize.query(
        `UPDATE "Companies" SET "dueDate" = '2099-12-31', "status" = true WHERE "id" = 1 AND "dueDate" IS NULL;`,
        { transaction: t }
      );
    });
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Versions", { id: 1 });
  }
};

