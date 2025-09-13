import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error";
import { logger } from "./logger";
import mcpRouter from "./mcp/router";
import { requireApiKey } from "./middleware/auth";

export function createServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(cors());

  // Health
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // REST auth (x-api-key) — đặt trước các route REST nếu muốn bảo vệ
  app.use(requireApiKey);

  // MCP chuẩn + REST test mount tại /mcp
  app.use("/mcp", mcpRouter);

  app.use(errorHandler);
  return app;
}

export function startServer(port: number) {
  const app = createServer();
  app.listen(port, () => logger.info({ port }, "server_started"));
}
