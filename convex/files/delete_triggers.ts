import { internalAction, internalMutation, mutation as rawMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { DataModel, Doc } from "../_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import { customCtx, customMutation } from "convex-helpers/server/customFunctions";
import { ConvexError, v } from "convex/values";

const triggers = new Triggers<DataModel>();

triggers.register("files", async (ctx, change) => {
  if (change.operation !== "delete") return;

  await ctx.scheduler.runAfter(0, internal.files.delete_triggers.deleteStorageFile, {
    file: change.oldDoc._id,
    path: change.oldDoc.path,
  });
});

export const deleteStorageFile = internalAction({
  args: {
    file: v.id("files"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    let url = `${process.env.FILE_SERVER_URL}/api/files`;
    const token = process.env.FILE_SERVER_TOKEN;

    const res = await fetch(url, {
      method: "DELETE",
      body: JSON.stringify({
        path: args.path,
        token,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const retryInMs = 30 * 60 * 1000; // 30 minutes
      await ctx.scheduler.runAfter(retryInMs, internal.files.delete_triggers.deleteStorageFile, args);
      throw new ConvexError("Could not delete file on file server: " + (await res.text()));
    }
  },
});

export const deleteMutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
