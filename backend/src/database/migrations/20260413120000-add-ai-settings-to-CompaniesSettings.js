"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const table = await queryInterface.describeTable("CompaniesSettings");
        if (!("aiAutoSummary" in table)) {
            await queryInterface.addColumn("CompaniesSettings", "aiAutoSummary", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "disabled",
                allowNull: false,
            });
        }
        if (!("aiSuggestResponse" in table)) {
            await queryInterface.addColumn("CompaniesSettings", "aiSuggestResponse", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "disabled",
                allowNull: false,
            });
        }
    },
    down: async (queryInterface) => {
        const table = await queryInterface.describeTable("CompaniesSettings");
        if ("aiAutoSummary" in table) {
            await queryInterface.removeColumn("CompaniesSettings", "aiAutoSummary");
        }
        if ("aiSuggestResponse" in table) {
            await queryInterface.removeColumn("CompaniesSettings", "aiSuggestResponse");
        }
    }
};
