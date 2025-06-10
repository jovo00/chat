import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getUser } from "../users/get";

export const many = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const tokens = await ctx.db
      .query("tokens")
      .withIndex("by_user_and_provider", (q) => q.eq("user", user._id))
      .collect();

    return tokens.map((token) => ({ ...token, token: "" }));
  },
});
