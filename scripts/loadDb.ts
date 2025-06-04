import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { 
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_APPLICATION_TOKEN, 
    OPENAI_API_KEY 
} = process.env;

const openai = new OpenAI({apiKey: OPENAI_API_KEY});

const jergy_berger_data = [
    "app/assets/Data Economics.pdf",
    "app/assets/Data Processing.pdf",
    "app/assets/Data Visualization.pdf",
    "app/assets/Digital Strategy.pdf",
    "app/assets/ERP.pdf",
    "app/assets/Resume Highlights.pdf",
    "app/assets/Interests.pdf",
    "app/assets/GDPR.pdf",
    "app/assets/Generative AI.pdf",
    "app/assets/Information Security.pdf",
    "app/assets/Linear Algebra.pdf",
    "app/assets/Mathematical Optimization.pdf",
    "app/assets/NLP.pdf",
    "app/assets/Predictive Analytics.pdf",
    "app/assets/Project Management.pdf",
    "app/assets/Quantitative Risk Management.pdf",
    "app/assets/Master thesis.pdf"
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
});

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: similarityMetric
        }
    })
    console.log(res)
};

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    for await (const path of jergy_berger_data) {
        const content = await load_Doc(path);
        const chunks = await splitter.splitText(content);
        for (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            });
            const vector = embedding.data[0].embedding;

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}


const load_Doc = async (relativePath: string): Promise<string | null> => {
    const absolutePath = path.resolve(__dirname, "..", relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        return null;
    }

    try {
        // Read PDF file buffer
        const dataBuffer = fs.readFileSync(absolutePath);
        const pdfData = await pdfParse(dataBuffer); // ✅ Correct usage
        return pdfData.text;
    } catch (error) {
        console.error(`Error loading document ${absolutePath}:`, error);
        return null;
    }
};

createCollection().then(() => loadSampleData())