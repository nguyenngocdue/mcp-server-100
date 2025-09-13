import { z } from "zod";
import type { MCPResult, ToolDef } from "../../types";


export const ping: ToolDef<{ name?: string }, MCPResult> = {
name: "ping",
description: "Return a hello message.",
inputSchema: z.object({ name: z.string().optional().default("world zzzzz") }),
async handler({ name }) {
	// console.log('[ping] handler called with:', { name });
	return { content: [{ type: "text", text: `hello, ${name}` }] };
},
};

export const inputSchema = z.object({ name: z.string().default("world, are you okay?") });