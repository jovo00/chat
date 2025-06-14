"use client";

import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "../../ui/button";
import { api } from "@gen/api";
import { Preloaded, usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import useChatState from "@/lib/state/chat";
import { Assistant } from "./assistant-content";
import { User } from "./user-content";

interface MessageListProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  preloadedMessages: Preloaded<typeof api.chat.get.messages>;
}

export const MessageList = memo(function MessageList({ preloadedMessages, scrollRef }: MessageListProps) {
  const { ref: inViewRef, inView } = useInView({ threshold: 0 });
  const lastScrollPosition = useRef(0);

  const messages = usePreloadedPaginatedQuery(preloadedMessages);

  const list = useMemo(() => {
    return [...messages.results].reverse();
  }, [messages?.results]);

  const drivenIds = useChatState((state) => state.streaming);
  const removeStreaming = useChatState((state) => state.removeStreaming);

  //   const reversed = useMemo(() => {
  //     return [...messages.results]?.reverse();
  //   }, [messages]);

  const fetchNextPage = useCallback(async () => {
    if (scrollRef.current) {
      lastScrollPosition.current = scrollRef.current.scrollTop;
    }
    messages.status === "CanLoadMore" && messages.loadMore(25);
  }, [messages, scrollRef]);

  const prevPageCount = useRef(messages.results.length);

  useEffect(() => {
    const currentPageCount = messages.results.length;
    if (prevPageCount.current < currentPageCount && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: lastScrollPosition.current,
        behavior: "instant",
      });
    }
    prevPageCount.current = currentPageCount;
  }, [messages.results, scrollRef]);

  useEffect(() => {
    if (inView && messages.status === "CanLoadMore" && !messages.isLoading) {
      fetchNextPage();
    }
  }, [inView, messages.status, messages.isLoading, fetchNextPage]);

  return (
    <>
      {!messages.isLoading && (
        <div ref={inViewRef} className="pointer-events-none z-50 -mb-64 flex min-h-[15em] w-full"></div>
      )}
      {!messages.isLoading && messages.status === "CanLoadMore" && (
        <Button
          variant={"secondary"}
          className="mx-auto mb-6 w-fit"
          onClick={fetchNextPage}
          disabled={messages.isLoading}
        >
          Load older messages
        </Button>
      )}

      {list.map((message) => (
        <Fragment key={message._id}>
          <User message={message} />
          <Assistant
            message={message}
            isStreamed={!!drivenIds.get(message.chat)?.has(message._id)}
            stopStreaming={() => {
              removeStreaming(message.chat, message._id);
            }}
          />
        </Fragment>
      ))}
    </>
  );
});
