import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
    args: {
        email: v.string(),
        userName: v.string(),
        imageUrl: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const existingUser = await ctx.db.query('users')
                .filter(q => q.eq(q.field('email'), args.email))
                .collect();

            if (existingUser.length === 0) {
                await ctx.db.insert('users', {
                    email: args.email,
                    userName: args.userName,
                    imageUrl: args.imageUrl
                });
                return 'inserted new user';
            }
            return 'User already exists';
        } catch (error) {
            console.error('Error in createUser mutation:', error);
            throw new Error('Failed to create user');
        }
    }
});