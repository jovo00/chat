import { internalMutation, mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { messageStatus } from "../schema";

export const updateContent = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    reasoning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { content: args.content });
  },
});

export const updateTitle = internalMutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, { title: args.title });
  },
});

export const updateMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    chatId: v.id("chats"),
    content: v.string(),
    status: messageStatus,
    status_message: v.optional(v.string()),
    reasoning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { messageId, chatId, ...data } = args;
    await ctx.db.patch(messageId, data);
    await ctx.db.patch(chatId, {
      latest_message_status: data.status,
      latest_message: messageId,
    });
  },
});

export const updateMessageError = internalMutation({
  args: {
    messageId: v.id("messages"),
    chatId: v.id("chats"),
    status: messageStatus,
    status_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { messageId, chatId, ...data } = args;
    await ctx.db.patch(messageId, data);
    await ctx.db.patch(chatId, {
      latest_message_status: data.status,
      latest_message: messageId,
    });
  },
});

export const messagePromptVisibility = mutation({
  args: {
    messageId: v.id("messages"),
    hide_prompt: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Not found");
    if (message.user !== user._id) throw new ConvexError("Not allowed");

    await ctx.db.patch(message._id, {
      hide_prompt: args.hide_prompt,
    });
  },
});

export const messageContentVisibility = mutation({
  args: {
    messageId: v.id("messages"),
    hide_content: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Not found");
    if (message.user !== user._id) throw new ConvexError("Not allowed");

    await ctx.db.patch(message._id, {
      hide_content: args.hide_content,
    });
  },
});

export const cancel = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const { messageId } = args;

    const message = await ctx.db.get(args.messageId);
    if (message?.user !== user._id) throw new ConvexError("Not allowed");

    await ctx.db.patch(messageId, {
      cancelled: true,
    });
  },
});

export const pinChat = mutation({
  args: {
    chatId: v.id("chats"),
    pin: v.boolean(),
  },
  async handler(ctx, args) {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new ConvexError("Not found");

    if (chat.user !== user._id) throw new ConvexError("Not allowed");

    await ctx.db.patch(chat._id, { pinned: args.pin });
  },
});

export const renameChat = mutation({
  args: {
    chatId: v.id("chats"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const newTitle = args.newTitle.trim();
    if (newTitle.length === 0) throw new ConvexError("Title cannot be empty");
    if (newTitle.length > 255) throw new ConvexError("Title can have 255 characters max");

    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new ConvexError("Not found");

    if (chat.user !== user._id) throw new ConvexError("Not allowed");
    if (chat.title === newTitle) return;

    await ctx.db.patch(chat._id, { title: newTitle });
  },
});
