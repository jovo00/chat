import { preloadPaginatedQuery } from "@/lib/convex/preload";
import Logo from "../icons/logos/logo";
import ChatInput from "./input/input";
import ModelSelect from "./input/model-select";
import { api } from "@gen/api";

export default async function NewChat() {
  const preloadedModels = await preloadPaginatedQuery(api.models.get.many, {}, { initialNumItems: 50 });

  return (
    <>
      <div className="h-auto w-full flex-1 overflow-y-auto">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <Logo className="mb-1 size-5 md:size-6" /> <h1 className="font-special text-xl md:text-2xl">Chat AI</h1>
          </div>
          <div className="mt-4 w-60 md:w-72">
            <ModelSelect preloadedModels={preloadedModels} />
          </div>
        </div>
      </div>
      <ChatInput preloadedModels={preloadedModels} />
    </>
  );
}
