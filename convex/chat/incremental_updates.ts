import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { GenericActionCtx } from "convex/server";

export class IncrementalUpdater {
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
      const cancelled = await this.ctx.runQuery(internal.chat.get.isCancelledInternal, {
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
