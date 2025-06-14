import { internalAction, internalMutation, mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { CoreMessage, generateText, LanguageModel, Message, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

function limitString(str: string, limit: number) {
  return str.length > limit ? str.substring(0, limit).trim() + "..." : str;
}

export const one = mutation({
  args: {
    prompt: v.string(),
    chat: v.optional(v.id("chats")),
    model: v.id("models"),
  },
  handler: async (ctx, args) => {
    if (args.prompt.trim().length === 0) throw new ConvexError("Prompt cannot be empty");

    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    let chatId = args.chat;
    if (!chatId) {
      chatId = await ctx.db.insert("chats", {
        user: user._id,
        last_modified: Date.now(),
        prompt_short: args.prompt.slice(0, 100),
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
    }

    const messageId = await ctx.db.insert("messages", {
      user: user._id,
      chat: chatId,
      prompt: args.prompt,
      status: "pending",
      status_message: undefined,
      model: args.model,
      hide: false,
      files: [],
      cancelled: false,
    });

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

export const assistantMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
  },
  async handler(ctx, args) {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Message not found");

    const model = await ctx.db.get(message.model);
    if (!model) throw new ConvexError("No model selected");

    const token = await ctx.db
      .query("tokens")
      .withIndex("by_user_and_provider", (q) => q.eq("user", message.user).eq("provider", model.api))
      .first();
    if (!token) throw new ConvexError(`No token for ${model.api} found`);

    let context: CoreMessage[] | Omit<Message, "id">[] | undefined = [];

    const maxContextTokenCount = Math.max(
      Math.min(20000, (model?.text_capabilities?.max_input_tokens ?? Infinity) / 2),
      10000,
    );
    let estimatedTokenCount = 0;

    let page: Doc<"messages">[];
    let continueCursor = null;
    let isDone = false;

    while (estimatedTokenCount < maxContextTokenCount && !isDone) {
      if (context.length > 100) break;

      ({ continueCursor, isDone, page } = await ctx.runQuery(internal.chat.get.paginateHistory, {
        paginationOpts: { numItems: 10, cursor: continueCursor },
        chatId: message.chat,
        creationTime: message._creationTime,
      }));

      for (const message of page) {
        estimatedTokenCount += estimateTokenCount(message);
        if (estimatedTokenCount > maxContextTokenCount) break;

        if (message.content && message.content?.trim()?.length > 0) {
          context.push({
            role: "assistant",
            content: message.content ?? "",
          });
        }

        if ((message.prompt ?? "").length > 0) {
          context.push({
            role: "user",
            content: message.prompt ?? "",
          });
        }
      }

      if (estimatedTokenCount > maxContextTokenCount) break;
    }

    await ctx.db.patch(message._id, {
      status: "generating",
    });

    context.reverse();

    return { context, token, model };
  },
});

function estimateTokenCount(message: Doc<"messages">) {
  // Currently estimating the token count by word count
  const promptWords = message?.prompt?.split("\n").join(" ").split(" ").length ?? 0;
  const contentWords = message?.content?.split("\n").join(" ").split(" ").length ?? 0;
  return (promptWords + contentWords) * 1.5;
}
