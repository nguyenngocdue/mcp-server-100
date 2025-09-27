import { Request, Response, NextFunction } from "express";
import { config } from "../config";

// Middleware xác thực API key cho REST endpoints
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  // Bỏ qua xác thực khi đang DEV
  if (process.env.DANGEROUSLY_OMIT_AUTH === "true") return next();

  // Bỏ qua xác thực cho các route MCP (dùng Bearer riêng)
  if (req.path === "/mcp" || req.path.startsWith("/mcp/")) return next();

  // Nếu không cấu hình API_KEY thì bỏ qua xác thực
  if (!config.apiKey) return next();

  // Kiểm tra x-api-key
  const apiKey = req.header("x-api-key");
  if (apiKey && apiKey === config.apiKey) {
    return next();
  }

  // Nếu không hợp lệ, trả về lỗi
  return res.status(401).json({ error: "unauthorized" });
}
