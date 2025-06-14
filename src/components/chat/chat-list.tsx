import { preloadPaginatedQuery } from "@/lib/convex/preload";
import ChatInput from "./input/input";
import { api } from "@gen/api";
import { Id } from "@gen/dataModel";
import Messages from "./message/messages";
import { getLastModelState } from "@/lib/state/cookies";

export default async function ChatList({ chatId }: { chatId: Id<"chats"> }) {
  const preloadedModels = await preloadPaginatedQuery(api.models.get.many, {}, { initialNumItems: 50 });
  const preloadedMessages = await preloadPaginatedQuery(api.chat.get.messages, { chatId }, { initialNumItems: 25 });
  const lastModelState = await getLastModelState();

  return (
    <>
      <div className="relative h-auto w-full flex-1 overflow-y-auto">
        <Messages preloadedMessages={preloadedMessages} />
      </div>
      <ChatInput preloadedModels={preloadedModels} chatId={chatId} lastModelState={lastModelState} />
    </>
  );
}
