"use client";

import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "../../ui/button";
import { api } from "@gen/api";
import { Preloaded, usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import useChatState from "@/lib/state/chat";
import { Assistant } from "./assistant/content";
import { User } from "./user/content";
import ErrorDisplay from "@/components/error";
import { createOptimisticMessage, getErrorMessage } from "@/lib/utils";
import useInputState from "@/lib/state/input";
import { Doc, Id } from "@gen/dataModel";

interface MessageListProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  preloadedMessages: Preloaded<typeof api.chat.get.messages>;
  chatId: Id<"chats">;
}

export const MessageList = memo(function MessageList({ preloadedMessages, scrollRef, chatId }: MessageListProps) {
  const { ref: inViewRef, inView } = useInView({ threshold: 0 });
  const messages = usePreloadedPaginatedQuery(preloadedMessages);
  const lastScrollPosition = useRef(0);
  const drivenIds = useChatState((state) => state.streaming);
  const removeStreaming = useChatState((state) => state.removeStreaming);
  const optimisticPrompts = useInputState((state) => state.optimisticPrompts);
  const model = useInputState((state) => state.model);

  const list = useMemo(() => {
    return [...messages.results].reverse();
  }, [messages?.results]);

  const fetchNextPage = useCallback(async () => {
    if (scrollRef.current) {
      lastScrollPosition.current = scrollRef.current.scrollHeight - scrollRef.current.scrollTop;
    }
    messages.status === "CanLoadMore" && messages.loadMore(25);
  }, [messages, scrollRef]);

  const prevPageCount = useRef(messages.results.length);

  useEffect(() => {
    const currentPageCount = messages.results.length;
    if (prevPageCount.current < currentPageCount && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight - lastScrollPosition.current,
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

  const optimisticMessage = useMemo(() => {
    if (!optimisticPrompts[chatId]) return undefined;

    return createOptimisticMessage(chatId, optimisticPrompts[chatId]);
  }, [optimisticPrompts[chatId]]);

  return (
    <>
      {messages?.isError &&
        (getErrorMessage(messages?.error) === "Not found" ? (
          <div className={"flex flex-col items-center justify-center"}>
            <h3 className="font-special text-lg text-red-500">Not found</h3>
            <p className="text-center">This chat does not exist</p>
          </div>
        ) : (
          <ErrorDisplay error={messages?.error} />
        ))}
      <div ref={inViewRef} className="pointer-events-none z-50 -mb-64 flex min-h-[15em] w-full"></div>
      {!messages.isLoading && messages.status === "CanLoadMore" && (
        <Button
          variant={"secondary"}
          className="absolute top-0 left-1/2 mx-auto h-10 w-fit -translate-x-1/2"
          onClick={fetchNextPage}
          disabled={messages.isLoading}
        >
          Load older messages
        </Button>
      )}

      {list.map((message, i) => (
        <Fragment key={message._id}>
          <User message={message} />
          <Assistant
            message={message}
            isStreamed={!!drivenIds.get(message.chat)?.has(message._id)}
            onStopStreaming={() => {
              removeStreaming(message.chat, message._id);
            }}
            isLast={i === list?.length - 1}
          />
        </Fragment>
      ))}

      {optimisticMessage && <User message={optimisticMessage} />}
      {optimisticMessage && <Assistant message={optimisticMessage} isStreamed={false} />}
    </>
  );
});
