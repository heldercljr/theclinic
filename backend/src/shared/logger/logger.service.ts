import { AuditType } from "@prisma/client";
import { AuditRepository } from "connection";
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
  defaultMeta: { service: "the-clinic-backend" },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new LokiTransport({
      host: process.env.LOKI_HOST || "http://localhost:3100",
      labels: { app: "the-clinic" },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
  ],
});

async function auditLog(
  description: string,
  type: AuditType,
  userDocument: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    logger.info(description, {
      auditType: type,
      userDocument,
      ...metadata,
    });

    await AuditRepository.create({
      data: {
        description,
        type,
        user: { connect: { document: userDocument } },
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error(`Failed to create audit log: ${errorMessage}`, {
      error: error instanceof Error ? error : String(error),
      attemptedLog: { description, type, userDocument },
    });
  }
}

function auditError(
  error: Error,
  context: string,
  userDocument?: string,
  createAuditEntry: boolean = false
): void {
  logger.error(`${context}: ${error.message}`, {
    error: error.stack,
    userDocument: userDocument || "system",
  });

  if (createAuditEntry && userDocument) {
    AuditRepository.create({
      data: {
        description: `Error: ${context} - ${error.message}`,
        type: "SYSTEM_ERROR",
        user: { connect: { document: userDocument } },
      },
    }).catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      logger.error(`Failed to create audit entry for error: ${errorMessage}`);
    });
  }
}

export { logger };
export { auditLog, auditError };
export default { logger, auditLog, auditError };
