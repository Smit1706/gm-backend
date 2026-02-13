"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const config_1 = require("prisma/config");
(0, dotenv_1.config)();
exports.default = (0, config_1.defineConfig)({
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
