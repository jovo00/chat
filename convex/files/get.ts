import { internalQuery, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { paginationOptsValidator } from "convex/server";

export const one = query({
  args: {
    file: v.id("files"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const file = await ctx.db.get(args.file);
    if (!file) throw new ConvexError("Not found");

    if (file.user !== user?._id) throw new ConvexError("Not authorized");

    return { file, url: await ctx.storage.getUrl(file.storage) };
  },
});

export const url = query({
  args: {
    file: v.id("files"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const file = await ctx.db.get(args.file);
    if (!file) throw new ConvexError("Not found");

    if (file.user !== user?._id) throw new ConvexError("Not authorized");

    return { url: await ctx.storage.getUrl(file.storage) };
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
      .order("desc")
      .paginate(args.paginationOpts);

    return files;
  },
});

export const getMetadata = internalQuery({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});
