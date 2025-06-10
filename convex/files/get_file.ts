import { query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/user";
import { paginationOptsValidator } from "convex/server";

export const one = query({
  args: {
    file: v.id("files"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);

    const file = await ctx.db.get(args.file);
    if (!file) throw new ConvexError("Not found");

    if (file.user !== user?._id) throw new ConvexError("Not authorized");

    return { file };
  },
});

export const download = query({
  args: {
    file: v.id("files"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.FILE_SERVER_TOKEN || process.env.FILE_SERVER_TOKEN === "") {
      throw new ConvexError("Internal Error");
    }

    if (args.token !== process.env.FILE_SERVER_TOKEN) {
      throw new ConvexError("Access denied");
    }

    const file = await ctx.db.get(args.file);
    if (!file) throw new ConvexError("Not found");

    return { file };
  },
});

export const many = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("user", user?._id))
      .paginate(args.paginationOpts);

    return files;
  },
});
