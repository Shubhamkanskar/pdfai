"use node";

import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { v } from "convex/values";

// Configuration with more lenient chunk settings
const GEMINI_CONFIG = {
    embedModel: "embedding-001",
    chatModel: "gemini-1.5-flash",
    maxResults: 1,
    chunkConfig: {
        minChunkSize: 10,     // Reduced minimum size
        maxChunkSize: 2000,   // Increased maximum size
        overlap: 50           // Added overlap for better context
    },
    aiConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
    }
};

// Initialize embeddings
const getEmbeddings = async (ctx) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("Initializing embeddings with API key available:", !!apiKey);

    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY not found in environment");
    }

    try {
        return new GoogleGenerativeAIEmbeddings({
            apiKey: apiKey,
            modelName: GEMINI_CONFIG.embedModel,
            taskType: TaskType.RETRIEVAL_DOCUMENT
        });
    } catch (error) {
        console.error("Error initializing embeddings:", error);
        throw new Error("Failed to initialize embeddings: " + error.message);
    }
};

// Generate AI response
const generateResponse = async (context, query) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY not found in environment");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: GEMINI_CONFIG.chatModel,
            generationConfig: GEMINI_CONFIG.aiConfig
        });

        const prompt = `
Context: ${context}

Question: ${query}

Instructions:
1. Provide a clear and concise answer based only on the given context
2. If the context is incomplete or unclear, mention that in your response
3. Use bullet points for listing key information
4. Keep the answer focused and relevant
5. If the context doesn't contain enough information, indicate that

Answer:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating response:", error);
        throw new Error("Failed to generate AI response: " + error.message);
    }
};

// Improved chunk processing
const processChunks = (chunks) => {
    const { minChunkSize, maxChunkSize } = GEMINI_CONFIG.chunkConfig;

    try {
        // First pass: Clean and validate chunks
        const cleanedChunks = chunks
            .filter(chunk => chunk && typeof chunk === "string")
            .map(chunk => chunk.trim())
            .filter(chunk => chunk.length > 0);

        if (cleanedChunks.length === 0) {
            throw new Error("No valid chunks after initial cleaning");
        }

        console.log(`Initial chunks count: ${cleanedChunks.length}`);

        // Second pass: Process and combine short chunks
        const processedChunks = [];
        let currentChunk = "";

        for (const chunk of cleanedChunks) {
            if (currentChunk.length + chunk.length <= maxChunkSize) {
                currentChunk = currentChunk
                    ? `${currentChunk} ${chunk}`
                    : chunk;
            } else {
                if (currentChunk) {
                    processedChunks.push(currentChunk);
                }
                currentChunk = chunk;
            }
        }

        if (currentChunk) {
            processedChunks.push(currentChunk);
        }

        console.log(`Processed chunks count: ${processedChunks.length}`);

        // Final pass: Create document objects
        return processedChunks.map(chunk => ({
            pageContent: chunk,
            metadata: {
                chunkLength: chunk.length,
                timestamp: new Date().toISOString()
            }
        }));
    } catch (error) {
        console.error("Error processing chunks:", error);
        throw new Error("Failed to process chunks: " + error.message);
    }
};

// Ingest action
export const ingest = action({
    args: {
        slitText: v.array(v.string()),
        fileId: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            console.log("Starting ingestion for fileId:", args.fileId);
            console.log("Initial chunk count:", args.slitText.length);

            // Initialize embeddings
            const embeddings = await getEmbeddings(ctx);
            console.log("Embeddings initialized successfully");

            // Process chunks
            const validChunks = processChunks(args.slitText)
                .map(chunk => ({
                    ...chunk,
                    metadata: {
                        ...chunk.metadata,
                        fileId: args.fileId
                    }
                }));

            if (validChunks.length === 0) {
                throw new Error("No valid text chunks to process");
            }

            console.log(`Processing ${validChunks.length} chunks for ingestion`);

            // Create vector store
            const vectorStore = await ConvexVectorStore.fromDocuments(
                validChunks,
                embeddings,
                { ctx }
            );

            return {
                success: true,
                message: "Documents successfully ingested",
                documentsCount: validChunks.length,
            };

        } catch (error) {
            console.error("Error in ingest:", error);
            return {
                success: false,
                message: error.message || "Failed to process documents",
                error: error.stack,
            };
        }
    },
});

// Search action
export const search = action({
    args: {
        query: v.string(),
        fileId: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            console.log("Starting search for query:", args.query);
            console.log("File ID:", args.fileId);

            const embeddings = await getEmbeddings(ctx);
            const vectorStore = new ConvexVectorStore(embeddings, { ctx });

            const searchResults = await vectorStore.similaritySearch(
                args.query,
                GEMINI_CONFIG.maxResults,
                (q) => q.eq(q.field("metadata.fileId"), args.fileId)
            );

            console.log("Search results found:", searchResults.length);

            if (!searchResults.length) {
                return {
                    success: false,
                    message: "No matching content found",
                    results: [],
                    aiResponse: null
                };
            }

            // Format results for Convex
            const formattedResults = searchResults.map(doc => ({
                pageContent: doc.pageContent || "",
                metadata: {
                    fileId: doc.metadata?.fileId || args.fileId,
                    timestamp: doc.metadata?.timestamp || new Date().toISOString()
                }
            }));

            // Generate AI response
            const context = searchResults.map(r => r.pageContent).join("\n\n");
            const aiResponse = await generateResponse(context, args.query);

            return {
                success: true,
                results: formattedResults,
                aiResponse: aiResponse,
                message: "Search completed successfully"
            };

        } catch (error) {
            console.error("Error in search:", error);
            return {
                success: false,
                message: error.message || "Search failed",
                results: [],
                aiResponse: null
            };
        }
    },
});