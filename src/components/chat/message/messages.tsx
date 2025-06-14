"use client";

import { api } from "@gen/api";

import { useScrollAnchor } from "@/lib/hooks/use-scroll-anchor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { MessageList } from "./list";
import { Preloaded } from "@/lib/convex/use-preload";

export default function Messages({
  preloadedMessages,
}: {
  preloadedMessages: Preloaded<typeof api.chat.get.messages>;
}) {
  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } = useScrollAnchor();

  return (
    <>
      <Button
        size={"icon"}
        variant={"secondary"}
        className={cn(
          "bg-accent hover:bg-popover pointer-events-none absolute bottom-2 left-1/2 z-50 h-12 w-12 shrink-0 -translate-x-1/2 scale-0 opacity-0 transition-all lg:h-10 lg:w-10",
          !isAtBottom && "pointer-events-auto bottom-3 scale-100 opacity-100 md:bottom-5",
        )}
        onClick={scrollToBottom}
      >
        <ArrowDown className="h-5 w-5 lg:h-4 lg:w-4" />
      </Button>

      {/* {showEmptyState && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 select-none w-full text-center p-2">
          There are no messages in this chat yet
        </div>
      )} */}

      <div
        className="relative flex h-fit max-h-full w-full flex-col-reverse gap-1 overflow-x-hidden overflow-y-auto"
        ref={scrollRef}
      >
        <div
          className="relative mx-auto flex h-fit w-full max-w-240 grow-0 flex-col gap-16 px-3 pt-4 pb-4 lg:px-2"
          ref={messagesRef}
        >
          <MessageList preloadedMessages={preloadedMessages} scrollRef={scrollRef} />

          <div className="h-px w-full" ref={visibilityRef} />
        </div>
      </div>
    </>
  );
}
