import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
                    imageUrl: args.imageUrl,
                    upgrade: false
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

export const userUpgrade = mutation({
    args: {
        userEmail: v.string()
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.query('users')
            .filter(q => q.eq(q.field('email'), args.userEmail))
            .collect();

        if (result) {
            const user = result[0];
            user.upgrade = true;
            await ctx.db.patch('users', user.id, user);
            return 'User upgraded successfully';
        } else {
            return 'User not found';
        }
    }
});

export const getUserInfo = query({
    args: {
        userEmail: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        if (!args.userEmail) { return null }
        const result = await ctx.db.query('users')
            .filter(q => q.eq(q.field('email'), args.userEmail))
            .collect();
        return result[0];
    }
});