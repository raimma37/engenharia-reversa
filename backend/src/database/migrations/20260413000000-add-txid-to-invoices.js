"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        const tableDesc = await queryInterface.describeTable("Invoices");
        if (!tableDesc.txid) {
            await queryInterface.addColumn("Invoices", "txid", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            });
        }
    },
    down: async (queryInterface) => {
        const tableDesc = await queryInterface.describeTable("Invoices");
        if (tableDesc.txid) {
            await queryInterface.removeColumn("Invoices", "txid");
        }
    },
};
