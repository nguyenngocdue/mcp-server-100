import { Router } from "express";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { getTool, listTools, InvokeBody } from "./registry";
import { config } from "../config";

const router = Router();

// ---------- Bearer auth cho MCP chuẩn ----------
router.use((req, res, next) => {
    // chỉ kiểm tra Bearer cho endpoint MCP chuẩn (POST "/")
    console.log("[STEP 1: req.body] ", req.body)

    if (req.method === "POST" && req.path === "/") {
        if (process.env.DANGEROUSLY_OMIT_AUTH === "true") return next();
        const expected = config.mcpToken;
        const auth = req.header("authorization") || "";
        const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
        if (!expected || bearer === expected) return next();
        return res.status(401).json({ error: "unauthorized" });
    }
    return next();
});

// ---------- MCP streamable-http (Inspector/clients MCP) ----------
const sessions: Record<string, StreamableHTTPServerTransport> = {};

// LƯU Ý: vì router sẽ được mount tại "/mcp", nên endpoint MCP phải là POST "/"
router.post("/", async (req, res) => {
  console.log("[STEP 2: POST] body =", req.body);
  let sid = req.header("mcp-session-id") as string | undefined;
  let transport: StreamableHTTPServerTransport;

  try {
    if (sid && sessions[sid]) {
      transport = sessions[sid];
    } else {
      // Luôn tạo session mới nếu không có sid
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions[id] = transport;
          sid = id;
          console.log("[MCP] Session initialized:", id);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete sessions[transport.sessionId];
          console.log("[MCP] Session closed:", transport.sessionId);
        }
      };

      const server = new McpServer({ name: "demo-mcp", version: "1.0.0" });

      for (const { name, description } of listTools()) {
        const def = getTool(name)!;
           server.registerTool(
                name,
                {
                    title: name,
                    description,
                    // QUAN TRỌNG: publish schema thật, không phải {} as any
                    // SDK signature là ZodRawShape, nên truyền .shape
                    inputSchema: (def.inputSchema as any).shape,
                },
                // SDK sẽ parse theo inputSchema rồi inject vào args
                async (args) => {
                    // args bây giờ đã là { values: number[] } đúng kiểu
                    console.log("[MCP] Tool args (parsed):", args);

                    // Không cần parse lại, nhưng nếu muốn chặt chẽ:
                    // const input = def.inputSchema.parse(args);
                    const out = await def.handler(args);

                    return {
                        ...out,
                        content: Array.isArray(out.content)
                            ? out.content.map((c: any) => ({ ...c }))
                            : [],
                    };
                }
            );

      }

      await server.connect(transport);

      // Trả về sessionId cho client nếu là request đầu tiên
      res.setHeader("mcp-session-id", sid!);
    }

    await transport.handleRequest(req, res, req.body);

  } catch (err: any) {
    console.error("[MCP ROUTE ERROR]", err);
    res.status(500).json({ error: "internal_error", message: err?.message });
  }
});


// ---------- REST test cho Postman (tiện dev) ----------
router.use(rateLimit({ windowMs: 60_000, max: 60 }));

router.get("/tools", (_req, res) => {
    res.json({ tools: listTools() });
});

router.post("/invoke", async (req, res) => {
    try {
        const body = InvokeBody.parse(req.body);
        const tool = getTool(body.tool);
        if (!tool) return res.status(404).json({ error: "unknown_tool" });
        const input = tool.inputSchema.parse(body.arguments);
        const out = await tool.handler(input);
        res.json(out);
    } catch (err: any) {
        res.status(400).json({ error: "bad_request", message: err?.message });
    }
});


export default router;
