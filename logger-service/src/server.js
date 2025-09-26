import express from "express";
import winston from "winston";
import LokiTransport from "winston-loki";
import { logCounter, errorCounter, responseTimeHistogram, setupMetrics } from "./metrics.js";

const app = express();
app.use(express.json());

setupMetrics(app);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new LokiTransport({
      host: process.env.LOKI_HOST || "http://localhost:3100",
      labels: { app: "the-clinic-logger-service" },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
  ],
});

app.post("/log", (req, res) => {
  const start = process.hrtime();
  const { level = "info", service = "unknown", message, metadata = {} } = req.body;
  logCounter.inc({ level, service });
  logger.log(level, message, metadata);
  res.status(200).json({ status: "logged" });
  const duration = process.hrtime(start);
  const seconds = duration[0] + duration[1] / 1e9;
  responseTimeHistogram.observe({ service }, seconds);
});

app.use((err, req, res, next) => {
  errorCounter.inc({ service: req.body?.service || "unknown" });
  res.status(500).send("Erro interno no logger-service");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Logger service running on port ${PORT}`);
});
