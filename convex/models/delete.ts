import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";

export const one = mutation({
  args: {
    model: v.id("models"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    if (user.role !== "admin") throw new ConvexError("Not allowed");

    await ctx.db.delete(args.model);
  },
});
