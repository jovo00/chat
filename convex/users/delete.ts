import { ConvexError } from "convex/values";
import { getUser } from "./user";
import { deleteMutation } from "./delete_triggers";

export const delete_account = deleteMutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    return { user };
  },
});
