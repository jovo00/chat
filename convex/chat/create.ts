import { internalAction, internalMutation, mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

function limitString(str: string, limit: number) {
  return str.length > limit ? str.substring(0, limit).trim() + "..." : str;
}

export const newChatMessage = mutation({
  args: {
    prompt: v.string(),
    chat: v.optional(v.id("chats")),
    model: v.id("models"),
    online: v.boolean(),
    files: v.array(v.id("files")),
  },
  handler: async (ctx, args) => {
    if (args.prompt.trim().length === 0) throw new ConvexError("Prompt cannot be empty");

    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    let chatId = args.chat;
    if (!chatId) {
      chatId = await ctx.db.insert("chats", {
        user: user._id,
        prompt_short: args.prompt.slice(0, 100),
        latest_message_status: "pending",
        pinned: false,
      });

      const token = await ctx.db
        .query("tokens")
        .withIndex("by_user_and_provider", (q) => q.eq("user", user._id).eq("provider", "openrouter"))
        .first();

      if (token && chatId) {
        ctx.scheduler.runAfter(0, internal.chat.create.generateTitle, {
          prompt: limitString(args.prompt, 5000),
          chat: chatId,
          encryptedToken: token.token,
        });
      }
    } else {
      const chat = await ctx.db.get(chatId);
      if (!chat) throw new ConvexError("Chat does not exist");

      if (chat.latest_message_status === "pending" || chat.latest_message_status === "generating")
        throw new ConvexError("Can only generate one message at a time");
    }

    const messageId = await ctx.db.insert("messages", {
      user: user._id,
      chat: chatId,
      prompt: args.prompt,
      status: "pending",
      status_message: undefined,
      model: args.model,
      hide_content: false,
      hide_prompt: false,
      files: args.files,
      cancelled: false,
      online: args.online,
    });

    await ctx.db.patch(chatId, { latest_message: messageId });

    return { messageId, chatId };
  },
});

export const generateTitle = internalAction({
  args: {
    chat: v.id("chats"),
    encryptedToken: v.string(),
    prompt: v.string(),
  },
  async handler(ctx, args) {
    const decryptedToken = await ctx.runAction(internal.tokens.actions.decryptToken, {
      encryptedToken: args.encryptedToken,
    });

    const openrouter = createOpenRouter({
      apiKey: decryptedToken,
    });

    const result = await generateText({
      model: openrouter("google/gemini-flash-1.5-8b"),
      messages: [
        {
          role: "system",
          content:
            "Write a short title for the following prompt snippet. Use 3 to 4 words. Use the language of the prompt. Don't be too creative, keep it simple and descriptive. Use simple worlds, be casual. Be as concise as possible. If the prompt is too short or unclear, don't ask for more information. You MUST always return a headline. Don't mention that it is a prompt or that you are writing a headline for a prompt. Don't use quotes.",
        },
        {
          role: "user",
          content: "Write a title for the following prompt snippet:\n\n" + args.prompt,
        },
      ],
    });

    if (result.text) {
      await ctx.runMutation(internal.chat.update.updateTitle, {
        chatId: args.chat,
        title: result.text,
      });
    }
  },
});
