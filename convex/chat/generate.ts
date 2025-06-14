import { httpAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
// import { OpenAI } from "openai";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { LanguageModel, streamText } from "ai";
import { GenericActionCtx } from "convex/server";

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

  const decryptedToken = await ctx.runAction(internal.tokens.actions.decryptToken, { encryptedToken: token.token });

  let apiModel: LanguageModel | undefined = undefined;

  if (model.api === "openrouter") {
    const openrouter = createOpenRouter({
      apiKey: decryptedToken,
    });
    apiModel = openrouter(model.api_id);
  }

  if (!apiModel) throw new ConvexError("Could not initialize model");

  const abortController = new AbortController();
  const result = streamText({
    model: apiModel,
    messages: context,
    abortSignal: abortController.signal,
  });

  let content = "";
  let reasoning: undefined | string = undefined;
  let incrementalUpdater = new IncrementalUpdater(ctx, messageId);

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const part of result.fullStream) {
        switch (part.type) {
          case "text-delta": {
            content += part.textDelta;
            controller.enqueue(encoder.encode(part.textDelta));
            await incrementalUpdater.update(part.textDelta);
            break;
          }
          case "reasoning": {
            if (!reasoning) {
              reasoning = part.textDelta;
            } else {
              reasoning += part.textDelta;
            }
            controller.enqueue(encoder.encode(part.textDelta));
            await incrementalUpdater.update(undefined, part.textDelta);
            break;
          }
          case "error": {
            controller.error(part.error);

            await ctx.runMutation(internal.chat.update.updateMessage, {
              messageId,
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
});

class IncrementalUpdater {
  ctx: GenericActionCtx<any>;
  messageId: Id<"messages">;
  promises: {
    updater: Promise<any>;
    cancel: Promise<any>;
  };
  cancelled: boolean;
  prevUpdaterSubmission: {
    time: number;
    content: number;
    reasoning: number;
  };
  prevCancelSubmission: {
    time: number;
    content: number;
    reasoning: number;
  };
  current: {
    content: string;
    reasoning: string;
  };

  constructor(ctx: GenericActionCtx<any>, messageId: Id<"messages">) {
    this.ctx = ctx;
    this.messageId = messageId;
    this.promises = {
      updater: Promise.resolve(),
      cancel: Promise.resolve(),
    };
    this.cancelled = false;
    this.prevUpdaterSubmission = {
      time: Date.now(),
      content: 0,
      reasoning: 0,
    };
    this.prevCancelSubmission = {
      time: Date.now(),
      content: 0,
      reasoning: 0,
    };
    this.current = {
      content: "",
      reasoning: "",
    };
  }

  async promiseStatus(promise: Promise<any>) {
    const t = {};
    return Promise.race([promise, t]).then(
      (v) => (v === t ? "pending" : "done"),
      () => "error",
    );
  }

  async update(contentDelta?: string, reasoningDelta?: string) {
    if (contentDelta) {
      this.current.content += contentDelta;
    }
    if (reasoningDelta) {
      this.current.reasoning += reasoningDelta;
    }

    await this.syncCancel();
    await this.syncUpdater();
  }

  async syncUpdater() {
    const updateInterval = 1000;
    const updateCharCount = 350;

    if (Date.now() - this.prevUpdaterSubmission.time < updateInterval) return;
    if (this.current.content.length < this.prevUpdaterSubmission.content + updateCharCount) return;
    if ((await this.promiseStatus(this.promises.updater)) === "pending") return;

    this.promises.updater = this.ctx.runMutation(internal.chat.update.updateContent, {
      messageId: this.messageId,
      content: this.current.content,
      reasoning: this.current.reasoning,
    });

    this.prevUpdaterSubmission = {
      time: Date.now(),
      content: this.current.content.length,
      reasoning: this.current.reasoning?.length ?? 0,
    };
  }

  async syncCancel() {
    const updateInterval = 500;
    const updateCharCount = 350;

    if (Date.now() - this.prevCancelSubmission.time < updateInterval) return;
    if (this.current.content.length < this.prevCancelSubmission.content + updateCharCount) return;
    if ((await this.promiseStatus(this.promises.cancel)) === "pending") return;

    this.promises.cancel = (async () => {
      const cancelled = await this.ctx.runQuery(internal.chat.get.cancelled, {
        message: this.messageId,
      });
      this.cancelled = !!cancelled;
    })();

    this.prevCancelSubmission = {
      time: Date.now(),
      content: this.current.content.length,
      reasoning: this.current.reasoning?.length ?? 0,
    };
  }

  async finish() {
    await this.promises.cancel;
    await this.promises.updater;
  }
}
