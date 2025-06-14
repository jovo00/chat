"use node";

import { ConvexError, v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { tokenProviders } from "../schema";
import { getUser } from "../users/get";
import { api, internal } from "../_generated/api";
import { decryptString, encryptString } from "../encryption";
import { Id } from "../_generated/dataModel";

export const setToken = action({
  args: {
    provider: tokenProviders,
    token: v.string(),
  },
  async handler(ctx, args): Promise<Id<"tokens">> {
    args.token = encryptString(args.token);
    return await ctx.runMutation(internal.tokens.update.set, args);
  },
});

export const decryptToken = internalAction({
  args: {
    encryptedToken: v.string(),
  },
  handler(ctx, args): string {
    return decryptString(args.encryptedToken);
  },
});
