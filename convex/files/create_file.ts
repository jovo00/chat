import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const file_upload = mutation({
  args: {
    title: v.string(),
    path: v.string(),
    extension: v.string(),
    mime: v.string(),
    size: v.int64(),
    uploadedBy: v.id("users"),
    apiKey: v.string(),
  },
  async handler(ctx, args) {
    if (args.apiKey !== process.env.FILE_SERVER_TOKEN) throw new ConvexError("Not authorized");

    const data = {
      path: args.path.replaceAll("\\", "/"),
      extension: args.extension,
      mime: args.mime,
      size: args.size,
      name: args.title,
      user: args.uploadedBy,
    };
    const fileId = await ctx.db.insert("files", data);
    const file = { _id: fileId, _creationTime: Date.now(), ...data };

    if (!fileId) throw new ConvexError("Could not add to storage");

    return { id: fileId };
  },
});
