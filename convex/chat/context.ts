import { internalMutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";

export const createContext = internalMutation({
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

    let context = [];

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

      ({ continueCursor, isDone, page } = await ctx.runQuery(internal.chat.get.paginateHistoryInternal, {
        paginationOpts: { numItems: 10, cursor: continueCursor },
        chatId: message.chat,
        creationTime: message._creationTime,
      }));

      for (const message of page) {
        estimatedTokenCount += estimateTokenCount(message);
        if (estimatedTokenCount > maxContextTokenCount) break;

        if (message.content && !message.hide_content && message.content?.trim()?.length > 0) {
          context.push({
            role: "assistant",
            content: message.content ?? "",
          });
        }

        if ((message.prompt ?? "").length > 0 && !message.hide_prompt) {
          if ((message.status === "generating" || message.status === "pending") && message.files.length > 0) {
            const files = (await Promise.allSettled(message.files.map((file) => ctx.db.get(file)))).map(
              async (file) => {
                if (file.status === "rejected" || !file.value) return undefined;

                if (file.value?.name?.endsWith(".pdf") && model.text_capabilities?.features.file_input) {
                  return {
                    type: "file",
                    data: await ctx.storage.getUrl(file.value.storage),
                    mimeType: "application/pdf",
                  };
                } else if (model.text_capabilities?.features.image_input) {
                  return { type: "image", image: await ctx.storage.getUrl(file.value!.storage) };
                }
              },
            );

            const filesContent = (await Promise.allSettled(files))
              .map((file) => (file.status === "fulfilled" ? file.value : undefined))
              .filter((f) => f !== undefined);

            context.push({
              role: "user",
              content: [{ type: "text", text: message.prompt ?? "" }, ...filesContent],
            });
          } else {
            context.push({
              role: "user",
              content: message.prompt ?? "",
            });
          }
        }
      }

      if (estimatedTokenCount > maxContextTokenCount) break;
    }

    await ctx.db.patch(message._id, {
      status: "generating",
    });

    await ctx.db.patch(message.chat, {
      latest_message_status: "generating",
      latest_message: message._id,
    });

    context.reverse();

    return { context, token, model, message };
  },
});

function estimateTokenCount(message: Doc<"messages">) {
  // Currently estimating the token count by word count
  const promptWords = message?.prompt?.split("\n").join(" ").split(" ").length ?? 0;
  const contentWords = message?.content?.split("\n").join(" ").split(" ").length ?? 0;
  return (promptWords + contentWords) * 1.5;
}
