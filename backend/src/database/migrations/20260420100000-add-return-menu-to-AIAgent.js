"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const tableDescription = await queryInterface.describeTable("AIAgents");
        if (!tableDescription.returnMenuEnabled) {
            await queryInterface.addColumn("AIAgents", "returnMenuEnabled", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            });
        }
        if (!tableDescription.returnMenuKeywords) {
            await queryInterface.addColumn("AIAgents", "returnMenuKeywords", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            });
        }
        if (!tableDescription.returnMenuMessage) {
            await queryInterface.addColumn("AIAgents", "returnMenuMessage", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            });
        }
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("AIAgents", "returnMenuEnabled");
        await queryInterface.removeColumn("AIAgents", "returnMenuKeywords");
        await queryInterface.removeColumn("AIAgents", "returnMenuMessage");
    },
};
