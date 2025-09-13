import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  apiKey: process.env.API_KEY || "",       // API key cho REST (Postman)
  mcpToken: process.env.MCP_TOKEN || "sk-123", // Bearer token cho MCP chuẩn
  env: process.env.NODE_ENV || "development",
};