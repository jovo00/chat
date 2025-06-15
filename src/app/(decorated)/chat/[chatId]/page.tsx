import ChatList from "@/components/chat/existing-chat";
import ShiftMobile from "@/components/layout/shift-mobile";
import { Id } from "@gen/dataModel";
import { ErrorBoundary } from "react-error-boundary";
import { messagesErrorRender } from "@/components/chat/messages/error";

export default async function Chat({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;

  return (
    <ShiftMobile>
      <div className="flex h-full flex-1 flex-col">
        <ErrorBoundary fallbackRender={messagesErrorRender}>
          <ChatList chatId={chatId as Id<"chats">} />
        </ErrorBoundary>
      </div>
    </ShiftMobile>
  );
}
