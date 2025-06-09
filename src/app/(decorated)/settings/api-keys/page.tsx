import ApiKeys from "@/components/settings/api-keys";
import { preloadUser } from "@/lib/auth/server";
import { preloadQuery } from "@/lib/convex/preload";
import { api } from "@gen/api";

export default async function ApiKeySettings() {
  const preloaded = await preloadUser();
  const preloadedTokens = await preloadQuery(api.tokens.get_tokens.many);

  return <ApiKeys preloadedUser={preloaded} preloadedTokens={preloadedTokens} />;
}
