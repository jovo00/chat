import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../convex/_generated/api";
import { preloadQuery } from "../convex/preload";

export async function preloadUser() {
  return await preloadQuery(api.users.user.current, {}, { token: await convexAuthNextjsToken() });
}
