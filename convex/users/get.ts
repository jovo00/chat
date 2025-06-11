import { getAuthUserId, getAuthSessionId, Doc } from "@convex-dev/auth/server";
import { MutationCtx, query, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export async function getUser(ctx: QueryCtx | MutationCtx): Promise<
  | (Doc<"users"> & {
      role?: "admin" | undefined;
    })
  | null
> {
  const userId = await getAuthUserId(ctx);
  let user: Doc<"users"> | undefined | null = undefined;
  if (userId) {
    user = await ctx.db.get(userId);
  }

  return user ?? null;
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) throw new ConvexError("Not authorized");

    if (user.image && !user.image.startsWith("https://")) {
      let url = await ctx.storage.getUrl(user.image as Id<"_storage">);
      if (url) {
        user.image = url;
      }
    }

    return { user };
  },
});
