import { z } from "zod";
import type { MCPResult, ToolDef } from "../../types";


export const whoami: ToolDef<z.infer<typeof inputSchema>, MCPResult> = {
    name: "whoami",
    description: "Return server metadata.",
    inputSchema: z.object({}),
    async handler() {
        return {
            content: [
                { type: "text", text: `pid: ${process.pid}, node: ${process.version}, now: ${new Date().toISOString()}` }
            ],
        };
    },
};


export const inputSchema = z.object({});