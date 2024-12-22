// fileStorage.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const getFileUrl = mutation(async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
});

export const AddFileEntryTodb = mutation({
    args: {
        fileId: v.string(),
        storageId: v.string(),
        fileName: v.string(),
        createdBy: v.string(),
        fileUrl: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('pdfFiles', {
            fileId: args.fileId,
            storageId: args.storageId,
            fileName: args.fileName,
            createdBy: args.createdBy,
            fileUrl: args.fileUrl
        });
        return 'inserted';
    }
});

export const getFileRecord = query({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.query('pdfFiles').filter(q => q.eq(q.field('fileId'), args.fileId))
            .collect();
        console.log(result)
        return result
    }
})