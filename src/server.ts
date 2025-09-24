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
  
  // Validate port before starting
  if (!port || port < 1 || port > 65535) {
    logger.error({ port }, "Invalid port number");
    process.exit(1);
  }
  
  app.listen(port, () => {
    logger.info({ port, env: process.env.NODE_ENV }, "server_started");
    console.log(`🚀 Server running on port ${port}`);
  });
  
  // Handle server errors
  app.on('error', (error: any) => {
    logger.error({ error: error.message }, "server_error");
    process.exit(1);
  });
}
