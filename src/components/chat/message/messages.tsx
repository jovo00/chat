"use client";

import { usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import { api } from "@gen/api";
import { Id } from "@gen/dataModel";
import { Preloaded } from "convex/react";
import { Fragment, useMemo } from "react";
import MessageItem from "./message-item";
import { Assistant } from "./assistant";
import useChatState from "@/lib/state/chat";

export default function Messages({
  preloadedMessages,
}: {
  preloadedMessages: Preloaded<typeof api.chat.get.messages>;
}) {
  const messages = usePreloadedPaginatedQuery(preloadedMessages);
  const drivenIds = useChatState((state) => state.streaming);
  const removeStreaming = useChatState((state) => state.removeStreaming);

  const reversed = useMemo(() => {
    return [...messages.results]?.reverse();
  }, [messages]);

  return (
    <div className="relative flex h-fit max-h-full w-full flex-col-reverse gap-1 overflow-x-hidden overflow-y-auto">
      <div className="relative mx-auto flex h-fit w-full max-w-240 grow-0 flex-col gap-8 px-3 pt-4 pb-4 lg:px-2">
        {reversed.map((message) => (
          <Fragment key={message._id}>
            <MessageItem message={message} isUser={true}>
              {message.prompt}
            </MessageItem>
            <MessageItem message={message} isUser={false}>
              <Assistant
                message={message}
                isDriven={!!drivenIds.get(message.chat)?.has(message._id)}
                stopStreaming={() => {
                  removeStreaming(message.chat, message._id);
                }}
              />
            </MessageItem>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
