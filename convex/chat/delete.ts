import { ConvexError, v } from "convex/values";
import { getUser } from "../users/get";
import { deleteMutation } from "../delete_triggers";

export const one = deleteMutation({
  args: {
    chat: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    const chat = await ctx.db.get(args.chat);
    if (!chat) throw new ConvexError("Not found");

    if (chat.user !== user._id) throw new ConvexError("You cannot delete the chat of another user");

    await ctx.db.delete(chat._id);
  },
});
