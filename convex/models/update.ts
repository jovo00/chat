import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";

export const rename = mutation({
  args: {
    modelId: v.id("models"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.newTitle.trim().length === 0) throw new ConvexError("Title cannot be empty");
    if (args.newTitle.trim().length > 255) throw new ConvexError("Title can have 255 characters max");

    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    if (user.role !== "admin") throw new ConvexError("Not allowed");

    await ctx.db.patch(args.modelId, {
      title: args.newTitle.trim(),
    });
  },
});
