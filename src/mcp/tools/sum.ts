import { z } from "zod";
import type { MCPResult, ToolDef } from "../../types";

// 1. Khai báo schema input trước
export const inputSchema = z.object({
  values: z.array(z.number())
});

// 2. Định nghĩa tool "sum"
export const sum: ToolDef<z.infer<typeof inputSchema>, MCPResult> = {
  name: "sum",
  description: "Sum a list of numbers.",
  inputSchema, // reuse schema đã khai báo
  async handler({ values }) {
    console.log("[TOOL] sum called with:", values);
    const total = values.reduce((a, b) => a + b, 0);
    return {
    //   content: [
    //     {
    //       type: "json",
    //       json: { total }
    //     }
    //   ]
     content: [{ type: "text", text: `total=${total}` }]
    };
  }
};
