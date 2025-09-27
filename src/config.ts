import "dotenv/config";

// Debug environment variables on startup
console.log("[CONFIG] Environment variables:", {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  HAS_X_API_KEY: !!process.env.X_API_KEY,
  HAS_MCP_TOKEN: !!process.env.MCP_TOKEN,
});

export const config = {
  port: parseInt(process.env.PORT || "3000", 10) || 3000,
  apiKey: process.env.X_API_KEY || "",       // API key cho REST (Postman)
  mcpToken: process.env.MCP_TOKEN || "sk-123", // Bearer token cho MCP chuẩn
  env: process.env.NODE_ENV || "development",
};

console.log("[CONFIG] Parsed config:", {
  port: config.port,
  env: config.env,
  hasXApiKey: !!config.apiKey,
  hasMcpToken: !!config.mcpToken,
});