"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const table = "Prompts";
        const existingTables = await queryInterface.showAllTables();
        if (existingTables.includes(table)) {
            const tableAttributes = await queryInterface.describeTable(table);
            if (!tableAttributes.voiceMode) {
                await queryInterface.addColumn(table, "voiceMode", {
                    type: sequelize_1.DataTypes.STRING,
                    defaultValue: "ambos",
                    allowNull: false
                });
            }
            if (!tableAttributes.voicePriority) {
                await queryInterface.addColumn(table, "voicePriority", {
                    type: sequelize_1.DataTypes.STRING,
                    defaultValue: "texto",
                    allowNull: false
                });
            }
        }
    },
    down: async (queryInterface) => {
        const table = "Prompts";
        const existingTables = await queryInterface.showAllTables();
        if (existingTables.includes(table)) {
            const tableAttributes = await queryInterface.describeTable(table);
            if (tableAttributes.voiceMode) {
                await queryInterface.removeColumn(table, "voiceMode");
            }
            if (tableAttributes.voicePriority) {
                await queryInterface.removeColumn(table, "voicePriority");
            }
        }
    }
};
