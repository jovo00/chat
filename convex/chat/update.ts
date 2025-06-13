import { internalMutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { messageStatus } from "../schema";

export const updateContent = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { content: args.content });
  },
});

export const updateMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    status: messageStatus,
    status_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { messageId, ...data } = args;
    await ctx.db.patch(messageId, data);
  },
});
