import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { apiProviders } from "../schema";

export const one = mutation({
  args: {
    api: apiProviders,
    api_id: v.string(),
    title: v.string(),
    text_capabilities: v.optional(
      v.object({
        max_input_tokens: v.number(),
        pricing: v.object({
          completion: v.number(),
          image: v.number(),
          prompt: v.number(),
          request: v.number(),
          web_search: v.number(),
        }),
        tokenizer: v.string(),
        features: v.object({
          text_input: v.boolean(),
          image_input: v.boolean(),
          file_input: v.boolean(),
          tools_input: v.boolean(),
          reasoning_output: v.boolean(),
        }),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    if (user.role !== "admin") throw new ConvexError("Not allowed");

    await ctx.db.insert("models", args);
  },
});
