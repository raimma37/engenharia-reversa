"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const tableDescription = await queryInterface.describeTable("AIAgents");
        if (!tableDescription.closeTicketEnabled) {
            await queryInterface.addColumn("AIAgents", "closeTicketEnabled", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            });
        }
        if (!tableDescription.closeTicketKeywords) {
            await queryInterface.addColumn("AIAgents", "closeTicketKeywords", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            });
        }
        if (!tableDescription.closeTicketMessage) {
            await queryInterface.addColumn("AIAgents", "closeTicketMessage", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            });
        }
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("AIAgents", "closeTicketEnabled");
        await queryInterface.removeColumn("AIAgents", "closeTicketKeywords");
        await queryInterface.removeColumn("AIAgents", "closeTicketMessage");
    },
};
