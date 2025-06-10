import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { tokenProviders } from "../schema";

export const set = mutation({
  args: {
    provider: tokenProviders,
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const token = await ctx.db
      .query("tokens")
      .withIndex("by_user_and_provider", (q) => q.eq("user", user._id).eq("provider", args.provider))
      .unique();

    if (token) {
      await ctx.db.patch(token._id, { token: args.token });
      return token._id;
    } else {
      const id = await ctx.db.insert("tokens", {
        provider: args.provider,
        token: args.token,
        user: user._id,
      });

      return id;
    }
  },
});

export const unset = mutation({
  args: {
    token: v.id("tokens"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const token = await ctx.db.get(args.token);
    if (token?.user !== user._id) throw new ConvexError("Not allowed");

    await ctx.db.delete(token._id);
  },
});
