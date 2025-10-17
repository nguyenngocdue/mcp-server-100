import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import OpenAI from "openai";
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

// Replace with your own file path or URL
(async () => {
  const fileId = await createFile(
    "https://twin-editor-mcp.s3.ap-southeast-2.amazonaws.com/twin-editor-mcp-data/message-media/1760629950712-wix8q6s491a.json"
  );
  console.log("fileId", fileId);

  // Create a vector store
  const vectorStore = await openai.vectorStores.create({
    name: "knowledge_base",
  });

  console.log("vectorStore ", vectorStore)

  // Associate the uploaded file with the vector store
  const fileAssociation = await openai.vectorStores.files.create(
    vectorStore.id,
    {
      file_id: fileId,
    }
  );

  console.log("fileAssociation", fileAssociation)

  const result = await openai.vectorStores.files.list(vectorStore.id);

  console.log("Result ", result);


  const response = await openai.responses.create({
    model: "gpt-5",
    input: "can you list all Assets of the file ?",
    tools: [
      {
        type: "file_search", // Specify the tool type
        vector_store_ids: [vectorStore.id], // Use the created vector store ID
        "max_num_results": 2, // Optional: limit the number of search results
        // "filters": {
        //     "type": "eq",
        //     "key": "category",
        //     "value": "blog"
        // }
      },
    ],
    include: ["file_search_call.results"]
  });
  console.log("response", JSON.stringify(response, null, 2));
})();


