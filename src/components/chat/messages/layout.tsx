"use client";

import { api } from "@gen/api";
import { useScrollAnchor } from "@/lib/hooks/use-scroll-anchor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { MessageList } from "./list";
import { Preloaded } from "@/lib/convex/use-preload";
import { useEffect, useLayoutEffect, useState } from "react";
import { Id } from "@gen/dataModel";
import { useQuery } from "@/lib/convex/use-query";

export default function Messages({
  preloadedMessages,
  chatId,
}: {
  preloadedMessages: Preloaded<typeof api.chat.get.messages>;
  chatId: Id<"chats">;
}) {
  const { data: chat } = useQuery(api.chat.get.chat, { chatId });
  const { messagesRef, scrollRef, visibilityRef, isVisible, scrollToBottom } = useScrollAnchor();
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!chat) return;
    const title = chat?.title && chat?.title?.trim()?.length > 0 ? chat?.title?.trim() : chat?.prompt_short;
    document.title = `${title} - jovochat`;
  }, [chat]);

  useLayoutEffect(() => {
    scrollToBottom();
    setInit(true);
  }, []);

  return (
    <>
      <Button
        size={"icon"}
        variant={"secondary"}
        className={cn(
          "bg-accent hover:bg-popover pointer-events-none absolute bottom-2 left-1/2 z-50 h-12 w-12 shrink-0 -translate-x-1/2 scale-0 opacity-0 transition-all lg:h-10 lg:w-10",
          !isVisible && init && "pointer-events-auto bottom-3 scale-100 opacity-100 md:bottom-5",
        )}
        onClick={() => scrollToBottom(true)}
      >
        <ArrowDown className="h-5 w-5 lg:h-4 lg:w-4" />
      </Button>

      <div
        className={cn(
          "message-list relative flex h-full max-h-full w-full gap-1 overflow-x-hidden overflow-y-auto opacity-0 transition-opacity",
          init && "opacity-100",
        )}
        ref={scrollRef}
      >
        <div
          className="relative mx-auto flex h-fit w-full max-w-240 grow-0 flex-col gap-2 px-3 py-8 pt-20 lg:px-4"
          ref={messagesRef}
        >
          <MessageList preloadedMessages={preloadedMessages} chatId={chatId} scrollRef={scrollRef} />

          <div className="h-px w-full" ref={visibilityRef} />
        </div>
      </div>
    </>
  );
}
