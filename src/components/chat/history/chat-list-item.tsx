"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DeleteChatDialog, RenameChatDialog } from "./dialogs";
import { ChatActions } from "./chat-actions";
import { Doc } from "@gen/dataModel";
import Loader from "@/components/ui/loader";

interface ChatListItemProps {
  chat: Doc<"chats">;
}

function ChatListItemComponent({ chat }: ChatListItemProps) {
  const { chatId: activeChatId } = useParams();
  const [isRenameOpen, setRenameOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const title = chat?.title && chat?.title?.trim()?.length > 0 ? chat?.title?.trim() : chat?.prompt_short;
  const isActive = activeChatId === chat?._id;

  const isGenerating = chat?.latest_message_status === "generating" || chat?.latest_message_status === "pending";

  const [prefetch, setPrefetch] = useState(false);

  return (
    <>
      <Link
        href={`/chat/${chat?._id}`}
        className="group relative flex h-10 shrink-0 cursor-pointer items-center overflow-hidden rounded-full pr-2 pl-3 text-sm"
        prefetch={prefetch}
        onPointerOver={() => setPrefetch(true)}
      >
        <div className={cn("w-full overflow-x-hidden whitespace-nowrap select-none", isActive && "font-semibold")}>
          {title}
        </div>

        <div className="history-menu-gradient pointer-events-none absolute top-0 right-0 h-full w-20"></div>

        {isGenerating && (
          <div className="relative z-5 size-8">
            <Loader small />
          </div>
        )}

        <div
          className={cn(
            "sidebar-hover-bg pointer-events-none absolute top-0 left-0 z-20 h-full w-full opacity-0 transition-opacity group-hover:opacity-40",
            (isActive || isMenuOpen) && "opacity-80 group-hover:opacity-80",
          )}
        ></div>

        <div
          className={cn(
            "history-menu-button-gradient pointer-events-none absolute top-0 right-0 z-10 h-full w-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            (isActive || isMenuOpen) && "opacity-100",
          )}
        ></div>

        <ChatActions
          onRename={() => setRenameOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          isActive={isActive}
          chatId={chat._id}
          menuOpen={isMenuOpen}
          isPinned={chat?.pinned}
          onOpenChange={setMenuOpen}
        />
      </Link>

      <RenameChatDialog open={isRenameOpen} onOpenChange={setRenameOpen} chat={chat} />
      <DeleteChatDialog open={isDeleteOpen} onOpenChange={setDeleteOpen} chat={chat} />
    </>
  );
}

export const ChatListItem = memo(ChatListItemComponent);
