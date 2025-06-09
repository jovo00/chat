import { internalAction, internalMutation, mutation as rawMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { DataModel, Doc } from "../_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import { customCtx, customMutation } from "convex-helpers/server/customFunctions";
import { asyncMap } from "convex-helpers";
import { getManyFrom } from "convex-helpers/server/relationships";
import { ConvexError, v } from "convex/values";

const triggers = new Triggers<DataModel>();

triggers.register("users", async (ctx, change) => {
  if (change.operation !== "delete") return;

  await asyncMap(await getManyFrom(ctx.db, "tokens", "by_user_and_provider", change.id, "user"), (token) =>
    ctx.db.delete(token._id)
  );
  await asyncMap(await getManyFrom(ctx.db, "chats", "by_user", change.id, "user"), (chat) => ctx.db.delete(chat._id));
  await asyncMap(await getManyFrom(ctx.db, "messages", "by_user", change.id, "user"), (message) =>
    ctx.db.delete(message._id)
  );
});

export const deleteMutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
