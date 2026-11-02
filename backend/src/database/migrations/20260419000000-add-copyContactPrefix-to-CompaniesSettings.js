"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const table = await queryInterface.describeTable("CompaniesSettings");
        if (!("copyContactPrefix" in table)) {
            await queryInterface.addColumn("CompaniesSettings", "copyContactPrefix", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
                defaultValue: null,
            });
        }
    },
    down: async (queryInterface) => {
        const table = await queryInterface.describeTable("CompaniesSettings");
        if ("copyContactPrefix" in table) {
            await queryInterface.removeColumn("CompaniesSettings", "copyContactPrefix");
        }
    },
};
