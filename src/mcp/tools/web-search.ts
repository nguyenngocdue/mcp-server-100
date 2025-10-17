import { z } from "zod";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const inputSchema = z.object({
  query: z.string(),
});

export const handler = async ({ query }: { query: string }) => {
  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    // tools: [{ type: 'web_search' }], // Removed unsupported tool type
    messages: [{ role: "user", content: query }],
  });

  const answer = response.choices[0]?.message?.content ?? "";

  return {
    content: [{ type: "text" as const, text: answer }],
  };
};

export default {
  name: "askOpenAI",
  description: "Send a query to OpenAI and get a response",
  inputSchema,
  handler,
};
