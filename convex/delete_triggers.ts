import { DataModel } from "./_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import { customCtx, customMutation } from "convex-helpers/server/customFunctions";
import { asyncMap } from "convex-helpers";
import { getManyFrom } from "convex-helpers/server/relationships";
import { mutation } from "./_generated/server";

const triggers = new Triggers<DataModel>();

triggers.register("users", async (ctx, change) => {
  if (change.operation !== "delete") return;

  await asyncMap(await getManyFrom(ctx.db, "authAccounts", "userIdAndProvider", change.id, "userId"), (account) =>
    ctx.db.delete(account._id),
  );
  await asyncMap(await getManyFrom(ctx.db, "authSessions", "userId", change.id, "userId"), (session) =>
    ctx.db.delete(session._id),
  );
  await asyncMap(await getManyFrom(ctx.db, "tokens", "by_user_and_provider", change.id, "user"), (token) =>
    ctx.db.delete(token._id),
  );
  await asyncMap(await getManyFrom(ctx.db, "chats", "by_user", change.id, "user"), (chat) => ctx.db.delete(chat._id));
  await asyncMap(await getManyFrom(ctx.db, "messages", "by_user_and_chat", change.id, "user"), (message) =>
    ctx.db.delete(message._id),
  );
  await asyncMap(await getManyFrom(ctx.db, "files", "by_user", change.id, "user"), (message) =>
    ctx.db.delete(message._id),
  );
});

triggers.register("chats", async (ctx, change) => {
  if (change.operation !== "delete") return;

  await asyncMap(await getManyFrom(ctx.db, "messages", "by_chat", change.id, "chat"), (message) =>
    ctx.db.delete(message._id),
  );
});

triggers.register("files", async (ctx, change) => {
  if (change.operation !== "delete") return;

  await ctx.storage.delete(change.oldDoc.storage);
});

export const deleteMutation = customMutation(mutation, customCtx(triggers.wrapDB));
