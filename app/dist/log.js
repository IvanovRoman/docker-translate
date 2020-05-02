"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
exports.default = new winston.loggers({
    transports: [new winston.transports.Console()],
});
//# sourceMappingURL=log.js.map