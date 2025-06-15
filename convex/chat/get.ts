import { ConvexError, v } from "convex/values";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { internalQuery, query } from "../_generated/server";
import { getUser } from "../users/get";
import { Doc, Id } from "../_generated/dataModel";

export const internalChat = internalQuery({
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

export const cancelled = internalQuery({
  args: {
    message: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.message);
    return message?.cancelled;
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
    if (!chat) throw new ConvexError("Not found");
    if (chat?.user !== user._id) throw new ConvexError("Not allowed");

    let messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_hide", (q) => q.eq("chat", chat._id))
      .order("desc")
      .paginate(args.paginationOpts);

    // Join models
    const modelIds = new Set(messages.page.map((message) => message.model));
    const modelPromises = await Promise.allSettled(Array.from(modelIds).map((modelId) => ctx.db.get(modelId)));
    const models: Map<Id<"models">, Doc<"models">> = new Map();
    modelPromises.forEach((promise) => {
      if (promise.status === "fulfilled" && promise.value) {
        models.set(promise.value._id, promise.value);
      }
    });

    messages.page.forEach((message, i) => {
      const model = models.get(message.model);
      if (model) {
        messages.page[i].model = model as any;
      }
    });

    // Join files

    const fileIds = new Set(messages.page.flatMap((message) => message.files));
    const filesPromises = await Promise.allSettled(
      Array.from(fileIds).map(async (fileId) => {
        try {
          return await ctx.db.get(fileId);
        } catch (e) {
          return Promise.reject();
        }
      }),
    );
    const files: Map<Id<"files">, Doc<"files">> = new Map();
    filesPromises.forEach((promise) => {
      if (promise.status === "fulfilled" && promise.value) {
        files.set(promise.value._id, promise.value);
      }
    });

    messages.page.forEach((message, i) => {
      const fileDocs = message.files.map((f) => files.get(f));
      messages.page[i].files = (fileDocs as any)?.map((f: any) => (f ? f : { _id: "deleted" }));
    });

    return messages as typeof messages & {
      page: typeof messages.page & { model: Id<"models"> | Doc<"models">; files: Id<"files">[] | Doc<"files">[] }[];
    };
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
      .withIndex("by_chat_and_hide", (q) => q.eq("chat", args.chatId!).eq("hide", false))
      .collect();

    return allMessages.map((message) => ({
      content: message?.content,
    }));
  },
});

export const chats = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    return await ctx.db
      .query("chats")
      .withIndex("by_user_and_pinned", (q) => q.eq("user", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const chat = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const chat = await ctx.db.get(args.chatId);
    if (chat?.user !== user._id) throw new ConvexError("Not allowed");

    return chat;
  },
});
