import { z } from "zod";
import fetch from "node-fetch";

export const inputSchema = z.object({});

export const handler = async (_input: {}) => {
  const url = "https://en.wikipedia.org/wiki/List_of_Singaporean_town_councils";
  const res = await fetch(url);
  const html = await res.text();

  // Parse town councils from HTML
  const regex = /<li><a href="\/wiki\/[^"#]+"[^>]*>([^<]+ Town Council)<\/a><\/li>/g;
  const councils: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    councils.push(match[1]);
  }

  // Chuyển thành MCPContent[]
  const content = councils.map((council) => ({ type: "text" as const, text: council }));
  return { content };
};

export default {
  name: "townCouncils",
  description: "Get list of Singaporean town councils from Wikipedia",
  inputSchema,
  handler,
};
