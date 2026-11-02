"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable("AIAgents", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            role: { type: sequelize_1.DataTypes.STRING, defaultValue: "general" },
            voiceTone: { type: sequelize_1.DataTypes.STRING, defaultValue: "friendly" },
            model: { type: sequelize_1.DataTypes.STRING, defaultValue: "gpt-4o-mini" },
            apiKey: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            languages: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            personality: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            isActive: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
            initialMessage: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            responseRules: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            allowTransfer: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
            transferKeywords: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            transferMessage: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            responseDelay: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 1 },
            maxChars: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 2000 },
            humanizeConversation: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
            audioEnabled: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            temperature: { type: sequelize_1.DataTypes.FLOAT, defaultValue: 1.0 },
            maxTokens: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 2000 },
            maxMessages: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 10 },
            promptTokens: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
            completionTokens: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
            totalTokens: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
            queueId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: { model: "Queues", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        });
        await queryInterface.createTable("AIAgentKnowledges", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            type: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            title: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            content: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            filePath: { type: sequelize_1.DataTypes.STRING, allowNull: true },
            mimeType: { type: sequelize_1.DataTypes.STRING, allowNull: true },
            agentId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: { model: "AIAgents", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("AIAgentKnowledges");
        await queryInterface.dropTable("AIAgents");
    },
};
