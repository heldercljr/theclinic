import axios from "axios";

const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || "http://logger-service:4000/log";

async function log(level: string, message: string, metadata: any = {}) {
  try {
    await axios.post(LOGGER_SERVICE_URL, { level, message, metadata });
  } catch (err) {
    // fallback: log localmente se falhar
    console.error(`[LoggerService] ${level}: ${message}`, metadata);
  }
}

export default {
  info: (msg: string, meta?: any) => log("info", msg, meta),
  warn: (msg: string, meta?: any) => log("warn", msg, meta),
  error: (msg: string, meta?: any) => log("error", msg, meta),
  debug: (msg: string, meta?: any) => log("debug", msg, meta),
};
