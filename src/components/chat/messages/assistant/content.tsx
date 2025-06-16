"use client";

import Loader from "@/components/ui/loader";
import { useStream } from "@/lib/chat/use-stream";
import { cn, updateListMargin } from "@/lib/utils";
import { Doc } from "@gen/dataModel";
import { useMemo, useEffect, memo, useRef } from "react";
import { AssistantMessageLayout } from "./layout";
import { ReasoningAccordion } from "./reasoning";
import MessageContent from "../content";
import { MessageStatus } from "./status";
import { useSmoothText } from "@/lib/chat/use-smooth-text";
import AssistantMessageFooter from "./footer";
import useInputState from "@/lib/state/input";

function AssistantComponent({
  message,
  isStreamed,
  onStopStreaming: stopStreaming,
  className,
  isLast,
}: {
  message: Doc<"messages">;
  isStreamed: boolean;
  onStopStreaming?: () => void;
  className?: string;
  isLast?: boolean;
}) {
  const clearOptimisticPrompt = useInputState((state) => state.clearOptimisticPrompt);
  const { content, reasoning, status } = useStream(message._id, isStreamed);

  const isCurrentlyStreaming = useMemo(() => {
    if (!isStreamed) return false;
    return status === "pending" || status === "streaming";
  }, [isStreamed, status]);

  useEffect(() => {
    if (!isStreamed) return;
    if (isCurrentlyStreaming) return;
    stopStreaming?.();
  }, [isStreamed, isCurrentlyStreaming, stopStreaming]);

  useEffect(() => {
    if (!isLast) return;
    clearOptimisticPrompt(message.chat);
  }, [message, isCurrentlyStreaming, isLast]);

  const currentContent = (message?.content?.length ?? 0 > content.length) ? message?.content : content;
  const currentReasoning =
    (message?.reasoning?.length ?? 0) > (reasoning?.length ?? 0) ? message?.reasoning : reasoning;

  const smoothContent = useSmoothText(currentContent ?? "", { charsPerSec: 1024 });
  const smoothReasoning = useSmoothText(currentReasoning ?? "", { charsPerSec: 1024 });

  const isLoading = message.status === "pending" || (message.status === "generating" && status === "pending");

  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (message?.content || message?.reasoning) {
      updateListMargin(messageRef);
    }
  }, [currentContent, currentReasoning]);

  return (
    <div className={cn("group relative flex w-full flex-col items-start gap-2", className)}>
      <AssistantMessageLayout message={message}>
        {(message?.reasoning || reasoning) && (
          <ReasoningAccordion
            reasoning={smoothReasoning[0]}
            isReasoning={!!currentReasoning && content?.length === 0 && message?.content?.length === 0 && isLoading}
          />
        )}

        <div ref={messageRef} className="message flex w-full max-w-full flex-1 grow-0 flex-col gap-4">
          {isLoading ? (
            <div className="relative ml-1 h-5 w-10 overflow-hidden">
              <Loader />
            </div>
          ) : (
            <>
              {currentContent && <MessageContent markdown={smoothContent[0]} />}
              <MessageStatus
                status={message?.status}
                statusMessage={message?.status_message}
                cancelled={message?.cancelled}
              />
            </>
          )}
        </div>
      </AssistantMessageLayout>

      {!isLoading && message.status === "done" && <AssistantMessageFooter message={message} />}
    </div>
  );
}
export const Assistant = memo(AssistantComponent);
