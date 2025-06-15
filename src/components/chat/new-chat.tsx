import Logo from "../icons/logos/logo";
import ChatInput from "./input/input";
import ModelSelect from "./input/model-select";
import { api } from "@gen/api";
import { getLastModelState } from "@/lib/state/cookies";
import { preloadPaginatedQuery, preloadQuery } from "@/lib/convex/preload";
import NeedsApiKey from "./api-key-check";

export default async function NewChat() {
  const preloadedModels = await preloadPaginatedQuery(api.models.get.many, {}, { initialNumItems: 50 });
  const preloadedTokens = await preloadQuery(api.tokens.get.many);
  const preloadedUser = await preloadQuery(api.users.get.current);
  const lastModelState = await getLastModelState();

  return (
    <NeedsApiKey preloadedTokens={preloadedTokens} preloadedUser={preloadedUser}>
      <div className="h-auto w-full flex-1 overflow-y-auto">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <Logo className="mb-1 size-5 md:size-6" /> <h1 className="font-special text-xl md:text-2xl">Chat AI</h1>
          </div>
          <div className="mt-4 w-60 md:w-72">
            <ModelSelect preloadedModels={preloadedModels} lastModelState={lastModelState} />
          </div>
        </div>
      </div>
      <ChatInput preloadedModels={preloadedModels} lastModelState={lastModelState} />
    </NeedsApiKey>
  );
}
