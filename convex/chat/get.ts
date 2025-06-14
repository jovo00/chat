import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internalQuery, query } from "../_generated/server";
import { getUser } from "../users/get";

export const chat = internalQuery({
  args: {
    chat: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chat);
  },
});

export const message = internalQuery({
  args: {
    message: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.message);
  },
});

export const paginateHistory = internalQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    chatId: v.id("chats"),
    creationTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", args.chatId).lte("_creationTime", args.creationTime))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const one = internalQuery({
  args: {
    message: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const message = await ctx.db.get(args.message);
    if (message?.user !== user._id) throw new ConvexError("Not allowed");

    return message;
  },
});

export const messages = query({
  args: {
    chatId: v.id("chats"),
    paginationOpts: paginationOptsValidator,
  },
  async handler(ctx, args) {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat?.user !== user._id) throw new ConvexError("Not allowed");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", chat._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return messages;
  },
});

export const history = internalQuery({
  args: {
    chatId: v.optional(v.id("chats")),
  },
  handler: async (ctx, args) => {
    if (!args.chatId) return [];
    // Grab all the user messages
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chat", args.chatId!))
      .collect();

    return allMessages.map((message) => ({
      content: message?.content,
    }));
  },
});
