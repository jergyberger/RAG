import { streamText } from "ai";
import { OpenAI } from "openai";
import { openai } from "@ai-sdk/openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const { 
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_APPLICATION_TOKEN, 
    OPENAI_API_KEY 
} = process.env;

const open_ai = new OpenAI({apiKey: OPENAI_API_KEY});
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const latestMessage = [...messages].reverse().find(m => m.role === "user")?.content;


        let docContext = "";

        const embedding = await open_ai.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"
        });

        try {
          const collection = await db.collection(ASTRA_DB_COLLECTION);
          const cursor = collection.find(null, {
            sort: {
              $vector: embedding.data[0].embedding,
            },
            limit: 5
          })
          const documents = await cursor.toArray();

          const docsMap = documents?.map(doc => doc.text)

          docContext = JSON.stringify(docsMap)
        } catch (error) {
          console.error("Error fetching from database:", error);
        }
        const template = {
            role: "system",
            content: `Use the below context to answer the user's questions about Jørgen as a future colleague and 
            or friend. The provided context includes my exams with executive summaries, as well as information
            about my interests and my resume. If you do not have the answer to a question, reason from the provided 
            context and let the user know that your answer is an informed guess as you do not have the required 
            information. If the query is personal, you can respond with a humorous tone and respond briefly, and if 
            it is technical, you should be concise and include specifics and examples where applicable.
            ------------------
            CONTEXT: ${docContext}
            ------------------
            QUESTION: ${latestMessage}
            ------------------`
        };
        const { textStream } = await streamText({
          model: openai("gpt-4"),
          messages: [template, ...messages],
        });
        return new Response(textStream);
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
