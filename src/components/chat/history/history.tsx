"use client";

import { cn, convertRemToPixels } from "@/lib/utils";
import { useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatListItem } from "./chat-list-item";
import { getChatDateDescription } from "@/lib/date";
import { Doc } from "@gen/dataModel";
import { api } from "@gen/api";
import { Preloaded, usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import { Pin } from "lucide-react";

type DisplayListItem =
  | { type: "pinned"; id: string }
  | { type: "chat"; id: string; chat: Doc<"chats"> }
  | { type: "date"; id: string; value: string };

export default function ChatHistory({
  collapsed,
  isDesktop,
  mobileMenuOpen,
  preloadedChatHistory,
}: {
  collapsed: boolean;
  isDesktop: boolean;
  mobileMenuOpen: boolean;
  preloadedChatHistory: Preloaded<typeof api.chat.get.chats>;
}) {
  const chatHistory = usePreloadedPaginatedQuery(preloadedChatHistory);

  const displayList: DisplayListItem[] = useMemo(() => {
    const items: DisplayListItem[] = [];
    const today = new Date();
    let hasPinned = false;

    chatHistory.results.forEach((chat, index) => {
      if (chat?.pinned) {
        if (!hasPinned) {
          items.push({
            type: "pinned",
            id: "pinned",
          });
          hasPinned = true;
        }

        items.push({ type: "chat", id: chat._id, chat });
      } else {
        const prevChat = index > 0 ? chatHistory.results[index - 1] : null;
        const dateDescription = getChatDateDescription(
          chat._creationTime,
          prevChat?._creationTime,
          today,
          prevChat?.pinned ?? false,
        );

        if (dateDescription) {
          items.push({
            type: "date",
            id: dateDescription,
            value: dateDescription,
          });
        }
        items.push({ type: "chat", id: chat._id, chat });
      }
    });
    return items;
  }, [chatHistory.results]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: displayList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) =>
      displayList[index].type === "date"
        ? index === 0
          ? convertRemToPixels(2.25)
          : convertRemToPixels(3)
        : convertRemToPixels(2.5),
    overscan: 5,
  });

  const { ref: inViewRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && chatHistory.status === "CanLoadMore" && !chatHistory.isLoading) {
      chatHistory.loadMore(50);
    }
  }, [inView, chatHistory.status, chatHistory.isLoading]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      className={cn(
        "absolute left-0 z-50 h-full w-[18rem] max-w-screen overflow-hidden transition-all duration-300 md:w-[20rem] lg:top-32 lg:h-[calc(100%-8rem)]",
        ((isDesktop && collapsed) || (!isDesktop && !mobileMenuOpen)) &&
          "pointer-events-none -translate-x-20 opacity-0",
      )}
    >
      <div ref={parentRef} className="h-full w-full overflow-y-auto px-2 py-6 pt-3">
        {displayList.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-center text-sm opacity-30">
            No Chats yet
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const item = displayList[virtualRow.index];
              const isFirstItem = virtualRow.index === 0;
              const isLastItem = virtualRow.index === displayList.length - 1;

              return (
                <div
                  key={item.id}
                  ref={isLastItem ? inViewRef : undefined}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {item.type === "date" ? (
                    <div
                      className={cn(
                        "flex h-12 items-end px-3 pb-2 text-xs font-bold opacity-50 select-none",
                        isFirstItem && "h-9",
                      )}
                    >
                      {item.value}
                    </div>
                  ) : item.type === "pinned" ? (
                    <div
                      className={cn(
                        "flex h-12 items-end px-3 pb-2 text-xs font-bold opacity-50 select-none",
                        isFirstItem && "h-9",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <Pin className="size-3.5" /> Pinned
                      </span>
                    </div>
                  ) : (
                    <ChatListItem chat={item.chat} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {chatHistory.status === "LoadingMore" && (
          <div className="py-4 text-center text-sm opacity-50">Loading more...</div>
        )}
      </div>
    </div>
  );
}
