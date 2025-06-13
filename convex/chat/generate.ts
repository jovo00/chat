import { httpAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
// import { OpenAI } from "openai";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";

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

  const body = (await request.json()) as {
    messageId?: Id<"messages">;
  };

  if (body?.messageId) {
    const message = await ctx.runQuery(internal.chat.get.message, { message: body.messageId });

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

  const message = body?.messageId!;

  let { context } = await ctx.runMutation(internal.chat.create.assistantMessage, { messageId: message });

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  let fullText = "";
  let updates = [];

  const sendChunks = async () => {
    const updateDbEvery = 100;
    let wait = updateDbEvery;
    try {
      for (const chunk of chunks) {
        const formattedChunk = chunk + "\n";
        fullText += formattedChunk;
        wait -= formattedChunk.length;

        if (wait < 0) {
          // TODO: Fix this. We should only update if no other mutation is pending. Also we should have a specific delay between updates not only character count
          updates.push(ctx.runMutation(internal.chat.update.updateContent, { messageId: message, content: fullText }));
          wait += updateDbEvery;
        }

        await writer.write(encoder.encode(formattedChunk));

        // simulate delay
        await delay(5);
      }

      await Promise.allSettled(updates);
      await ctx.runMutation(internal.chat.update.updateMessage, {
        messageId: message,
        content: fullText,
        status: "done",
      });
    } catch (e) {
      await ctx.runMutation(internal.chat.update.updateMessage, {
        messageId: message,
        content: fullText,
        status: "error",
        status_message: "Error while generating response",
      });
      console.error("An error occurred during streaming:", e);
      await writer.abort(e);
    } finally {
      await writer.close();
    }
  };

  sendChunks();

  return new Response(readable, {
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL!,
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      Vary: "Origin",
    },
  });

  // Start streaming and persisting at the same time while
  // we immediately return a streaming response to the client
  // const response = await streamingComponent.stream(
  //   ctx,
  //   request,
  //   body.streamId as StreamId,
  //   async (ctx, request, streamId, append) => {
  //     // Lets grab the history up to now so that the AI has some context
  //     const history = await ctx.runQuery(internal.chat.get.history, {
  //       chatId: body.chatId!,
  //     });

  //     // Lets kickoff a stream request to OpenAI
  //     const stream = await openai.chat.completions.create({
  //       model: "gpt-4.1-mini",
  //       messages: [
  //         {
  //           role: "system",
  //           content: `You are a helpful assistant that can answer questions and help with tasks.
  //         Please provide your response in markdown format.

  //         You are continuing a conversation. The conversation so far is found in the following JSON-formatted value:`,
  //         },
  //         ...(history as ChatCompletionMessageParam[]),
  //       ],
  //       stream: true,
  //     });

  //     // Append each chunk to the persistent stream as they come in from openai
  //     for await (const part of stream) await append(part.choices[0]?.delta?.content || "");
  //   },
  // );

  // response.headers.set("Access-Control-Allow-Origin", "*");
  // response.headers.set("Vary", "Origin");
});
