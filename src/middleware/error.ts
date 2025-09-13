import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, "unhandled_error");
  res.status(err?.statusCode || 500).json({
    error: "internal_error",
    message: err?.message || "Internal Server Error",
  });
}
