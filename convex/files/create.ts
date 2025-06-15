import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { getUser } from "../users/get";

export const one = internalMutation({
  args: {
    storage: v.id("_storage"),
    name: v.string(),
  },
  async handler(ctx, args) {
    const user = await getUser(ctx);
    if (!user) {
      ctx.storage.delete(args.storage);
      throw new ConvexError("Not authorized");
    }

    const _id = await ctx.db.insert("files", {
      name: args.name,
      storage: args.storage,
      user: user._id,
    });

    const file = await ctx.db.get(_id);
    if (!file) throw new ConvexError("Not found");

    return { ...file, url: await ctx.storage.getUrl(file.storage) };
  },
});
