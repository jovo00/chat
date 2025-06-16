import ChatList from "@/components/chat/existing-chat";
import ShiftMobile from "@/components/layout/shift-mobile";
import { Id } from "@gen/dataModel";
import { ErrorBoundary } from "react-error-boundary";
import { MessageError } from "@/components/chat/messages/error";
import { Metadata, ResolvingMetadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@gen/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

type Props = {
  params: Promise<{ chatId: Id<"chats"> }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { chatId } = await params;

  const chat = await fetchQuery(api.chat.get.chat, { chatId: chatId }, { token: await convexAuthNextjsToken() });
  const title = chat?.title && chat?.title?.trim()?.length > 0 ? chat?.title?.trim() : chat?.prompt_short;

  return {
    title: `${title} - jovochat`,
    description: chat?.prompt_short,
  };
}

export default async function Chat({ params }: Props) {
  const { chatId } = await params;

  return (
    <ShiftMobile>
      <div className="relative flex h-full flex-1 flex-col">
        <ErrorBoundary fallbackRender={MessageError}>
          <ChatList chatId={chatId as Id<"chats">} />
        </ErrorBoundary>
      </div>
    </ShiftMobile>
  );
}
