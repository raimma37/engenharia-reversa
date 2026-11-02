"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const tableDescription = await queryInterface.describeTable("AIAgents");
        if (!tableDescription.transferUserIds) {
            await queryInterface.addColumn("AIAgents", "transferUserIds", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                defaultValue: null,
                comment: "JSON array of user IDs to transfer to when shouldTransfer=true",
            });
        }
        if (!tableDescription.transferUserMode) {
            await queryInterface.addColumn("AIAgents", "transferUserMode", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
                defaultValue: "random",
                comment: "random | sequence | specific",
            });
        }
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("AIAgents", "transferUserIds");
        await queryInterface.removeColumn("AIAgents", "transferUserMode");
    },
};
