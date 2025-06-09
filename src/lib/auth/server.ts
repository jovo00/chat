import { api } from "@gen/api";
import { preloadQuery } from "@/lib/convex/preload";

export async function preloadUser() {
  return await preloadQuery(api.users.user.current);
}

export type PreloadedUser = Awaited<ReturnType<typeof preloadUser>>;
