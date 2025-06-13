import { internalMutation, mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { PaginationOptions } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";

export const one = mutation({
  args: {
    prompt: v.string(),
    chat: v.optional(v.id("chats")),
    model: v.id("models"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    let chatId = args.chat;
    if (!chatId) {
      chatId = await ctx.db.insert("chats", {
        user: user._id,
        last_modified: Date.now(),
        prompt_short: args.prompt.slice(0, 100),
      });
    }

    const messageId = await ctx.db.insert("messages", {
      user: user._id,
      chat: chatId,
      prompt: args.prompt,
      status: "pending",
      status_message: undefined,
      model: args.model,
      role: "user",
      hide: false,
      files: [],
      cancelled: false,
    });

    return { messageId, chatId };
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

    let context = [];

    const maxContextTokenCount = Math.min(20000, (model?.text_capabilities?.max_input_tokens ?? Infinity) / 2);
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

        context.push({
          role: message.role,
          content: message.content,
        });
      }

      if (estimatedTokenCount > maxContextTokenCount) break;
    }

    await ctx.db.patch(message._id, {
      status: "generating",
    });

    return { context };
  },
});

function estimateTokenCount(message: Doc<"messages">) {
  // Currently estimating the token count by word count
  return (message?.content?.split("\n").join(" ").split(" ").length ?? 0) * 1.5;
}
