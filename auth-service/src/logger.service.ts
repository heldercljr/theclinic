import winston from "winston";
import LokiTransport from "winston-loki";

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const LOG_COLORS = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

const TIMESTAMP_FORMAT = "DD/MM/YYYY HH:mm:ss";

winston.addColors(LOG_COLORS);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: TIMESTAMP_FORMAT }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels: LOG_LEVELS,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "auth-service" },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new LokiTransport({
      host: process.env.LOKI_HOST || "http://localhost:3100",
      labels: { app: "auth-service" },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
  ],
});

export { logger };
export default logger;

