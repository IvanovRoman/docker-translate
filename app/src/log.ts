import * as winston from "winston"

export default new winston.loggers({
  transports: [new winston.transports.Console()],
})
