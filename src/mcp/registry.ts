import { z } from "zod";
import type { MCPResult, ToolDef } from "../types";
import { ping } from "./tools/ping";
import { sum } from "./tools/sum";
import { whoami } from "./tools/whoami";
import webSearchOpenAI from "./tools/web-search";
import getCoordinates from "./tools/get-coordinates";
import fileSearch from "./tools/file-search";

export type AnyTool = ToolDef<any, MCPResult>;

const registry = new Map<string, AnyTool>();

function register(tool: AnyTool) {
  registry.set(tool.name, tool);
}

// register tools
register(ping);
register(sum);
register(whoami);
register(webSearchOpenAI);
register(getCoordinates);
register(fileSearch);

export function listTools() {
  return Array.from(registry.values()).map((t) => ({ name: t.name, description: t.description }));
}

export function getTool(name: string): AnyTool | undefined {
  return registry.get(name);
}

// Schema cho REST invoke
export const InvokeBody = z.object({
  tool: z.string(),
  arguments: z.record(z.any()).default({}),
});
