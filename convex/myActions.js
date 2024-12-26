"use node";

import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { v } from "convex/values";

// Centralized configuration
const GEMINI_CONFIG = {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    embedModel: "text-embedding-004",
    chatModel: "gemini-1.5-flash",
    maxResults: 3,
};

// Initialize embeddings with proper configuration
const getEmbeddings = () => new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_CONFIG.apiKey,
    model: GEMINI_CONFIG.embedModel,
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document embeddings",
});

// Initialize chat model with proper configuration
const getChatModel = () => {
    const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
    return genAI.getGenerativeModel({
        model: GEMINI_CONFIG.chatModel,
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        },
    });
};

export const ingest = action({
    args: {
        slitText: v.array(v.string()),
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        try {
            console.log("Starting ingestion for fileId:", args.fileId);

            // Validate and clean text chunks with more robust validation
            const validChunks = args.slitText
                .filter(chunk => {
                    const isValid = chunk &&
                        typeof chunk === 'string' &&
                        chunk.trim().length > 0;
                    if (!isValid) {
                        console.warn("Filtered out invalid chunk:", chunk);
                    }
                    return isValid;
                })
                .map(chunk => ({
                    pageContent: chunk.trim(),
                    metadata: {
                        fileId: args.fileId,
                        timestamp: new Date().toISOString()
                    }
                }));

            if (validChunks.length === 0) {
                throw new Error("No valid text chunks to process");
            }

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
                getEmbeddings(),
                { ctx }
            );

            // Get relevant documents
            const results = await vectorStore.similaritySearch(
                args.query,
                GEMINI_CONFIG.maxResults
            );

            // Filter results by fileId
            const filteredResults = results.filter(item =>
                item.metadata?.fileId === args.fileId
            );

            console.log("Filtered results:", filteredResults);

            // Get chat response based on context
            const chatModel = getChatModel();
            const chat = chatModel.startChat();

            // Construct context from filtered results
            const context = filteredResults
                .map(r => r.pageContent)
                .join('\n\n');

            // Get AI response with context
            const response = await chat.sendMessage(
                `Context:\n${context}\n\nQuestion: ${args.query}`
            );

            return JSON.stringify({
                success: true,
                results: filteredResults,
                aiResponse: response.text(),
                message: "Search completed successfully"
            });

        } catch (error) {
            console.error("Error in search:", error);
            return JSON.stringify({
                success: false,
                message: error.message,
                results: [],
                aiResponse: null
            });
        }
    },
});