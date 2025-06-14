import ChatList from "@/components/chat/chat-list";
import { messagesErrorRender } from "@/components/chat/message/error-fallback";
import Messages from "@/components/chat/message/messages";
import NewChat from "@/components/chat/new-chat";
import ShiftMobile from "@/components/layout/shift-mobile";
import { preloadPaginatedQuery } from "@/lib/convex/preload";
import { api } from "@gen/api";
import { Id } from "@gen/dataModel";
import { ErrorBoundary } from "react-error-boundary";

export default async function Chat({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;

  return (
    <ShiftMobile>
      <div className="flex h-full flex-1 flex-col overflow-y-auto">
        <ErrorBoundary fallbackRender={messagesErrorRender}>
          <ChatList chatId={chatId as Id<"chats">} />
        </ErrorBoundary>
      </div>
    </ShiftMobile>
  );
}
