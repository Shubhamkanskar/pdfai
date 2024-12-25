"use node";

import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

// Initialize embeddings configuration
const getEmbeddings = () => new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    model: "text-embedding-004",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
});

export const ingest = action({
    args: {
        slitText: v.array(v.string()),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        try {
            console.log("Starting ingestion for fileId:", args.fileId);
            console.log("Number of text chunks:", args.slitText.length);

            // Validate and clean the text chunks
            const validChunks = args.slitText
                .filter(chunk => chunk && typeof chunk === 'string' && chunk.trim().length > 0)
                .map(chunk => ({
                    pageContent: chunk.trim(),
                    metadata: { fileId: args.fileId }
                }));

            if (validChunks.length === 0) {
                throw new Error("No valid text chunks to process");
            }

            // Initialize vector store with the processed chunks
            const vectorStore = await ConvexVectorStore.fromDocuments(
                validChunks,
                getEmbeddings(),
                { ctx }
            );

            console.log(`Successfully processed ${validChunks.length} chunks`);

            return {
                success: true,
                message: "Documents successfully ingested",
                documentsCount: validChunks.length
            };
        } catch (error) {
            console.error("Error in ingest:", error);
            return {
                success: false,
                message: error.message || "Failed to process documents",
                error: error.stack
            };
        }
    },
});

export const search = action({
    args: {
        query: v.string(),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        try {
            console.log("Search query:", args.query);
            console.log("File ID:", args.fileId);

            const vectorStore = new ConvexVectorStore(
                new GoogleGenerativeAIEmbeddings({
                    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
                    model: "text-embedding-004",
                    taskType: TaskType.RETRIEVAL_DOCUMENT,
                    title: "Document title",
                }),
                { ctx }
            );

            const results = await vectorStore.similaritySearch(args.query, 3);
            console.log("All search results:", results);

            // Reconstruct fileId from metadata characters
            const filteredResults = results.filter((item) => {
                // Join all the character values in metadata to reconstruct the fileId
                const reconstructedFileId = Object.values(item.metadata).join('');
                return reconstructedFileId === args.fileId;
            });

            console.log("Filtered results:", filteredResults);

            return JSON.stringify({
                success: filteredResults.length > 0,
                results: filteredResults,
                message: filteredResults.length > 0 ? "Documents found" : "No matching documents found"
            });

        } catch (error) {
            console.error("Error in search:", error);
            return JSON.stringify({
                success: false,
                message: error.message,
                results: []
            });
        }
    },
});