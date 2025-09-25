import express from "express";
import winston from "winston";
import LokiTransport from "winston-loki";

const app = express();
app.use(express.json());

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
  const { level = "info", message, metadata = {} } = req.body;
  logger.log(level, message, metadata);
  res.status(200).json({ status: "logged" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Logger service running on port ${PORT}`);
});

