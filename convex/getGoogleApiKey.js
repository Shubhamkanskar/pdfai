// getGoogleApiKey.js
import { internalAction } from "./_generated/server";

export default internalAction({
    handler: async (ctx) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY not found in Convex configuration");
        }
        return apiKey;
    },
});