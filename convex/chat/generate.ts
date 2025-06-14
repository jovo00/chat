import { httpAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
// import { OpenAI } from "openai";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { createOpenRouter, LanguageModelV1, OpenRouterProvider } from "@openrouter/ai-sdk-provider";
import { LanguageModel, streamText } from "ai";

export const completeChat = httpAction(async (ctx, request) => {
  let user = await ctx.runQuery(api.users.get.current);
  if (!user) throw new ConvexError("Not authorized");

  const body = (await request.json()) as {
    messageId?: Id<"messages">;
  };

  if (body?.messageId) {
    const message = await ctx.runQuery(internal.chat.get.message, {
      message: body.messageId,
    });

    if (!message || message?.user !== user.user._id) {
      throw new ConvexError("Not allowed to access this chat");
    } else if (message?.status !== "pending") {
      return new Response("", {
        headers: {
          "Access-Control-Allow-Origin": process.env.SITE_URL!,
          "Content-Type": "text/plain; charset=utf-8",
          Vary: "Origin",
        },
      });
    }
  }

  const messageId = body?.messageId!;

  const { context, token, model } = await ctx.runMutation(internal.chat.create.assistantMessage, {
    messageId: messageId,
  });

  console.log(context);

  const decryptedToken = await ctx.runAction(internal.tokens.actions.decryptToken, { encryptedToken: token.token });

  let apiModel: LanguageModel | undefined = undefined;

  if (model.api === "openrouter") {
    const openrouter = createOpenRouter({
      apiKey: decryptedToken,
    });
    apiModel = openrouter(model.api_id);
  }

  if (!apiModel) throw new ConvexError("Could not initialize model");

  const { textStream } = streamText({
    model: apiModel,
    messages: context,
    // providerOptions: {
    //   openrouter: {
    //     reasoning: {
    //       max_tokens: 10,
    //     },
    //   },
    // },
    onError: (e) => {
      console.log(e);
    },
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      const updateDbMinChars = 200;
      const updateDbMaxDelay = 5000;
      let backgroundUpdatePromise: Promise<void | null> = Promise.resolve();
      let lastUpdateTime = Date.now();
      let charsSinceLastUpdate = 0;

      try {
        for await (const chunk of textStream) {
          fullText += chunk;
          charsSinceLastUpdate += chunk.length;

          controller.enqueue(encoder.encode(chunk));

          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdateTime;

          if (charsSinceLastUpdate >= updateDbMinChars && timeSinceLastUpdate >= updateDbMaxDelay) {
            const textToSave = fullText;
            backgroundUpdatePromise = backgroundUpdatePromise.then(() =>
              ctx.runMutation(internal.chat.update.updateContent, {
                messageId: messageId,
                content: textToSave,
              }),
            );
            charsSinceLastUpdate = 0;
            lastUpdateTime = now;
          }
        }

        // Wait for all background updates to finish, then set final status
        await backgroundUpdatePromise.then(() =>
          ctx.runMutation(internal.chat.update.updateMessage, {
            messageId: messageId,
            content: fullText,
            status: "done",
          }),
        );
      } catch (e) {
        console.error("An error occurred during streaming:", e);
        // Ensure pending updates settle before marking as an error
        await backgroundUpdatePromise;
        await ctx.runMutation(internal.chat.update.updateMessage, {
          messageId: messageId,
          content: fullText,
          status: "error",
          status_message: "Error while generating response",
        });
        // Signal an error to the stream consumer
        controller.error(e);
      } finally {
        // This is critical: close the stream when all work is done.
        // The controller might already be closed if an error was thrown,
        // so we check `byobRequest` which is null when closed.
        controller.close();
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
});
