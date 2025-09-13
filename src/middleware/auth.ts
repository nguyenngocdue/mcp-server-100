import { Request, Response, NextFunction } from "express";
import { config } from "../config";

// Auth cho REST endpoints (không áp cho MCP streamable-http, MCP dùng Bearer riêng)
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  // Cho phép bỏ qua khi DEV
  if (process.env.DANGEROUSLY_OMIT_AUTH === "true") return next();

  // Bỏ qua auth cho MCP chuẩn (route này dùng Bearer trong router MCP)
  if (req.path === "/mcp" || req.path.startsWith("/mcp/")) return next();

  if (!config.apiKey) return next(); // không đặt API_KEY thì không kiểm tra

  const key = req.header("x-api-key");
  if (key && key === config.apiKey) return next();

  return res.status(401).json({ error: "unauthorized" });
}
