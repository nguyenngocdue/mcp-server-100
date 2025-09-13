import { z } from "zod";

export interface RequestWithUser extends Express.Request {
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export type MCPText = { type: "text"; text: string };
export type MCPJson = { type: "json"; json: unknown };
export type MCPContent = MCPText | MCPJson;


export interface ToolDef<In, Out> {
name: string;
description: string;
inputSchema: z.ZodType<In>;
handler: (input: In) => Promise<Out> | Out;
}

export type MCPResult = { content: MCPContent[] };