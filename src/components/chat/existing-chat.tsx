import ChatInput from "./input/input";
import Messages from "./messages/layout";
import { preloadPaginatedQuery, preloadQuery } from "@/lib/convex/preload";
import { getLastModelState } from "@/lib/state/cookies";
import { Id } from "@gen/dataModel";
import { api } from "@gen/api";

export default async function ChatList({ chatId }: { chatId: Id<"chats"> }) {
  const preloadedModels = await preloadPaginatedQuery(api.models.get.many, {}, { initialNumItems: 50 });
  const preloadedMessages = await preloadPaginatedQuery(api.chat.get.messages, { chatId }, { initialNumItems: 10 });
  const preloadedTokens = await preloadQuery(api.tokens.get.many);
  const lastModelState = await getLastModelState();

  return (
    <>
      <div className="relative h-full w-full flex-1 overflow-y-auto">
        <Messages preloadedMessages={preloadedMessages} chatId={chatId} />
      </div>
      <ChatInput preloadedModels={preloadedModels} chatId={chatId} lastModelState={lastModelState} />
    </>
  );
}
