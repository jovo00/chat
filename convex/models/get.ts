import { query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { paginationOptsValidator } from "convex/server";

export const one = query({
  args: {
    model: v.id("models"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const model = await ctx.db.get(args.model);
    if (!model) throw new ConvexError("Not found");

    return model;
  },
});

export const many = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const models = await ctx.db.query("models").withIndex("by_title").order("asc").paginate(args.paginationOpts);

    return models;
  },
});
