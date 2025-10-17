import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import OpenAI from "openai";
import z from "zod";
const openai = new OpenAI();

interface CreateFileResult {
  id: string;
  [key: string]: any;
}

async function createFile(filePath: string): Promise<string> {
  let result: CreateFileResult;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    // Download the file content from the URL
    const res: Response = await fetch(filePath);
    const buffer: ArrayBuffer = await res.arrayBuffer();
    const urlParts: string[] = filePath.split("/");
    const fileName: string = urlParts[urlParts.length - 1];
    const file: File = new File([buffer], fileName);
    result = await openai.files.create({
      file: file,
      purpose: "assistants",
    });
  } else {
    // Handle local file path
    const fileContent: fs.ReadStream = fs.createReadStream(filePath);
    result = await openai.files.create({
      file: fileContent,
      purpose: "assistants",
    });
  }
  return result.id;
}

// Prepare fileId and vectorStore for use in handler
let fileId: string;
let vectorStore: OpenAI.VectorStore;

async function initialize() {
  fileId = await createFile(
    "https://twin-editor-mcp.s3.ap-southeast-2.amazonaws.com/twin-editor-mcp-data/message-media/1760629950712-wix8q6s491a.json"
  );
  console.log("fileId", fileId);

  vectorStore = await openai.vectorStores.create({
    name: "knowledge_base",
  });

  console.log("vectorStore ", vectorStore);

  const fileAssociation = await openai.vectorStores.files.create(
    vectorStore.id,
    {
      file_id: fileId,
    }
  );

  console.log("fileAssociation", fileAssociation);

  const result = await openai.vectorStores.files.list(vectorStore.id);

  console.log("Result ", result);
}

// Call initialize at startup
initialize();

export const handler = async () => {
  const response = await openai.responses.create({
    model: "gpt-5",
    tools: [
      {
        type: "file_search",
        vector_store_ids: [vectorStore.id],
      },
    ],
  });
  const answer = JSON.stringify(response) ?? "";
  return { content: [{ type: "text" as const, text: answer }] };

};

export const inputSchema = z.object({
  query: z.string(),
});

export default {
  name: "fileSearch",
  description: "Search and summarize content from uploaded files",
  inputSchema,
  handler,
};

