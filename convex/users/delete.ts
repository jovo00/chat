import { ConvexError } from "convex/values";
import { getUser } from "./get";
import { deleteMutation } from "../delete_triggers";

export const current = deleteMutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    await ctx.db.delete(user._id);
  },
});
