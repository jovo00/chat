import { internalAction, internalMutation, mutation as rawMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { DataModel, Doc } from "../_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import { customCtx, customMutation } from "convex-helpers/server/customFunctions";
import { ConvexError, v } from "convex/values";

const triggers = new Triggers<DataModel>();

triggers.register("files", async (ctx, change) => {
  if (change.operation !== "delete") return;

  await ctx.storage.delete(change.oldDoc.storage);
});

export const deleteMutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
