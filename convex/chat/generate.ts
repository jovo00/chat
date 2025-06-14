import { httpAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
// import { OpenAI } from "openai";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// const openai = new OpenAI();

const loremIpsum = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.
Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est.
Mauris placerat eleifend leo.
`;

const chunks = loremIpsum.trim().split(" ");
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const completeChat = httpAction(async (ctx, request) => {
  let user = await ctx.runQuery(api.users.get.current);
  if (!user) throw new ConvexError("Not authorized");

  //     const openrouter = createOpenRouter({
  //   apiKey: 'YOUR_OPENROUTER_API_KEY',
  // });

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

  const { context, token } = await ctx.runMutation(internal.chat.create.assistantMessage, {
    messageId: messageId,
  });

  const decryptedToken = await ctx.runAction(internal.tokens.actions.decryptToken, { encryptedToken: token.token });

  // const apiKey = decryptString(token.token);
  // console.log(apiKey);

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
        for (const chunk of chunks) {
          const formattedChunk = chunk + "\n";
          fullText += formattedChunk;
          charsSinceLastUpdate += formattedChunk.length;

          controller.enqueue(encoder.encode(formattedChunk));

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

          await delay(5);
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
