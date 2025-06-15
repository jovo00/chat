import ApiKeys from "@/components/settings/api-keys";
import { preloadQuery } from "@/lib/convex/preload";
import { api } from "@gen/api";

export default async function ApiKeySettings() {
  const preloadedTokens = await preloadQuery(api.tokens.get.many);

  return <ApiKeys preloadedTokens={preloadedTokens} />;
}
