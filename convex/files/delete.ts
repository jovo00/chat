import { ConvexError, v } from "convex/values";
import { deleteMutation } from "../delete_triggers";
import { getUser } from "../users/get";

export const one = deleteMutation({
  args: {
    file: v.id("files"),
  },
  async handler(ctx, args) {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const file = await ctx.db.get(args.file);
    if (!file) throw new ConvexError("Not found");

    if (file.user !== user._id) throw new ConvexError("Not allowed");

    await ctx.db.delete(args.file);

    return { deleted: true };
  },
});

export const many = deleteMutation({
  args: {
    files: v.array(v.id("files")),
  },
  async handler(ctx, args) {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    await Promise.all(
      args.files.map(async (f) => {
        const file = await ctx.db.get(f);
        if (!file) throw new ConvexError("Not found");

        if (file.user !== user._id) throw new ConvexError("Not allowed");

        return ctx.db.delete(f);
      }),
    );

    return { deleted: true };
  },
});
