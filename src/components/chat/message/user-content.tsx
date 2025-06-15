"use client";

import { cn, updateListMargin } from "@/lib/utils";
import { Doc } from "@gen/dataModel";
import { useEffect, memo, useRef } from "react";
import MessageContent from "./content";
import { UserWrapper } from "./user-wrapper";
import UserMessageFooter from "./user-footer";

function UserComponent({ message, className }: { message: Doc<"messages">; className?: string }) {
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (message?.prompt) {
      updateListMargin(messageRef);
    }
  }, [message?.prompt]);

  return (
    <UserWrapper message={message}>
      <div ref={messageRef} className="message flex w-full max-w-full flex-1 grow-0 flex-col">
        {message?.prompt && <MessageContent markdown={message?.prompt} isUser />}
      </div>
    </UserWrapper>
  );
}
export const User = memo(
  UserComponent,
  (prev, next) => prev.message.prompt === next.message.prompt && prev.className === next.className,
);
