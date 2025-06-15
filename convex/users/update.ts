import { ConvexError, v } from "convex/values";
import { getUser } from "./get";
import { mutation } from "../_generated/server";

export const current = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    if (args.name.trim().length < 1 || args.name.trim().length > 100) {
      throw new ConvexError("Your name should have at least 1 character and no more than 100");
    }

    await ctx.db.patch(user._id, { name: args.name.trim() });
  },
});
