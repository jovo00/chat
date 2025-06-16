import { httpAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CoreMessage, LanguageModel, streamText } from "ai";
import { IncrementalUpdater } from "./incremental_updates";
import { dataTypes, encodeData } from "./encoding";

export const completeChat = httpAction(async (ctx, request) => {
  let user = await ctx.runQuery(api.users.get.current);
  if (!user) throw new ConvexError("Not authorized");

  const body = (await request.json()) as {
    messageId?: Id<"messages">;
  };

  if (!body.messageId) throw new ConvexError("Missing messageId");

  const initialMessage = await ctx.runQuery(internal.chat.get.getMessageInternal, {
    message: body.messageId,
  });

  if (!initialMessage || initialMessage?.user !== user._id) {
    throw new ConvexError("Not allowed to access this chat");
  } else if (initialMessage?.status !== "pending") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": process.env.SITE_URL!,
        "Content-Type": "text/plain; charset=utf-8",
        Vary: "Origin",
      },
    });
  }

  const messageId = initialMessage._id;
  const chatId = initialMessage.chat;

  const { context, token, model, message } = await ctx.runMutation(internal.chat.context.createContext, {
    messageId: initialMessage._id,
  });

  const abortController = new AbortController();

  try {
    const decryptedToken = await ctx.runAction(internal.tokens.actions.decryptToken, { encryptedToken: token.token });

    let apiModel: LanguageModel | undefined = undefined;

    if (model.api === "openrouter") {
      const openrouter = createOpenRouter({
        apiKey: decryptedToken,
      });
      if (message.online) {
        apiModel = openrouter(model.api_id + ":online");
      } else {
        apiModel = openrouter(model.api_id);
      }
    }

    if (!apiModel) throw new ConvexError("Could not initialize model");

    const result = streamText({
      model: apiModel,
      messages: context as CoreMessage[],
      abortSignal: abortController.signal,
    });

    let content = "";
    let reasoning: undefined | string = undefined;
    let incrementalUpdater = new IncrementalUpdater(ctx, message._id);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const part of result.fullStream) {
          switch (part.type) {
            case "text-delta": {
              content += part.textDelta;
              controller.enqueue(encoder.encode(encodeData(dataTypes.CONTENT, part.textDelta)));
              await incrementalUpdater.update(part.textDelta);
              break;
            }
            case "reasoning": {
              if (!reasoning) {
                reasoning = part.textDelta;
              } else {
                reasoning += part.textDelta;
              }
              controller.enqueue(encoder.encode(encodeData(dataTypes.REASONING, part.textDelta)));
              await incrementalUpdater.update(undefined, part.textDelta);
              break;
            }
            case "error": {
              controller.error(part.error);

              await ctx.runMutation(internal.chat.update.updateMessage, {
                messageId,
                chatId,
                content,
                reasoning,
                status: "error",
                status_message: (part.error as Error)?.message ?? "Error while generating response",
              });
              break;
            }
            case "finish": {
              content = await result.text;
              reasoning = await result.reasoning;

              await incrementalUpdater.finish();

              await ctx.runMutation(internal.chat.update.updateMessage, {
                messageId,
                chatId,
                content,
                reasoning,
                status: "done",
              });

              controller.close();
              break;
            }
          }

          if (incrementalUpdater.cancelled) {
            await ctx.runMutation(internal.chat.update.updateMessage, {
              messageId,
              chatId,
              content,
              reasoning,
              status: "done",
            });

            abortController.abort();
            controller.close();
          }
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Access-Control-Allow-Origin": process.env.SITE_URL!,
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        Vary: "Origin",
      },
    });
  } catch (err) {
    console.log(err);

    abortController.abort();
    let errorMessage = "Could not generate a response";

    if (err instanceof ConvexError) {
      errorMessage = err?.data;
    }

    await ctx.runMutation(internal.chat.update.updateMessageError, {
      messageId: message._id,
      chatId: message.chat,
      status: "error",
      status_message: errorMessage,
    });

    throw err;
  }
});
