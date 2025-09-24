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
  const sid = req.header("mcp-session-id") as string | undefined;
  console.log("[CHECK - mcp-session-id]:", sid);

  let transport: StreamableHTTPServerTransport;

  try {
    if (sid && sessions[sid]) {
      // Reuse session
      transport = sessions[sid];

    } else if (!sid && isInitializeRequest(req.body)) {
      // Create new session
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions[id] = transport;
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

      // Register all tools
      for (const { name, description } of listTools()) {
        const def = getTool(name)!;
        console.log(`[MCP] Register tool: ${name}`);

        // server.registerTool(
        //   name,
        //   { title: name, description },
        //   async (args: any, _extra: any) => {
        //     // Lấy đúng input cho tool
        //     const realArgs =
        //       args?.arguments ??
        //       args?.params?.arguments ??
        //       args;
        //     console.log("[MCP] Tool args:", realArgs);

        //     const input = def.inputSchema.parse(realArgs ?? {});
        //     const out = await def.handler(input);

        //     return {
        //       ...out,
        //       content: Array.isArray(out.content)
        //         ? out.content.map((c: any) => ({ ...c }))
        //         : [],
        //     };
        //   }
        // );
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
                async (args: any) => {
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

    } else {
      console.error("[SESSION ERROR] No valid session", { sid, body: req.body });
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID" },
        id: null,
      });
      return;
    }

    // Handle request
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
