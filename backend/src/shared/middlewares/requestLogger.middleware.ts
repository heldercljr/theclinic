import { Request, Response, NextFunction } from "express";
import { logger } from "../logger/logger.service";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  next();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userDocument: req.user?.document || "anonymous",
    };

    if (res.statusCode >= 500) {
      logger.error(
        `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`,
        logData
      );
    } else if (res.statusCode >= 400) {
      logger.warn(
        `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`,
        logData
      );
    } else {
      logger.info(
        `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`,
        logData
      );
    }
  });
}
