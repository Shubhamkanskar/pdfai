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
        try {
            const users = await ctx.db.query('users')
                .filter(q => q.eq(q.field('email'), args.userEmail))
                .collect();

            if (users.length > 0) {
                const user = users[0];

                // Update only the upgrade field
                await ctx.db.patch(user._id, {
                    upgrade: true
                });

                return 'User upgraded successfully';
            }
            return 'User not found';
        } catch (error) {
            console.error('Error in userUpgrade mutation:', error);
            throw new Error('Failed to upgrade user');
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