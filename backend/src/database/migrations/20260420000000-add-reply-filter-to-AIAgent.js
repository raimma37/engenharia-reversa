"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const tableDescription = await queryInterface.describeTable("AIAgents");
        if (!tableDescription.replyMode) {
            await queryInterface.addColumn("AIAgents", "replyMode", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "all",
                allowNull: false,
            });
        }
        if (!tableDescription.replyContactIds) {
            await queryInterface.addColumn("AIAgents", "replyContactIds", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            });
        }
        if (!tableDescription.replyTagIds) {
            await queryInterface.addColumn("AIAgents", "replyTagIds", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            });
        }
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("AIAgents", "replyMode");
        await queryInterface.removeColumn("AIAgents", "replyContactIds");
        await queryInterface.removeColumn("AIAgents", "replyTagIds");
    },
};
