"use client";

import Logo from "@/components/icons/logos/logo";
import Loader from "@/components/ui/loader";
import { useStream } from "@/lib/chat/use-stream";
import { cn, updateListMargin } from "@/lib/utils";
import { Doc } from "@gen/dataModel";
import { useMemo, useEffect, memo, useRef } from "react";
import { AssistantMessageWrapper } from "./assistant-wrapper";
import { ReasoningAccordion } from "./reasoning";
import MessageContent from "./content";
import { MessageStatus } from "./status";

function AssistantComponent({
  message,
  isStreamed,
  stopStreaming,
  className,
}: {
  message: Doc<"messages">;
  isStreamed: boolean;
  stopStreaming: () => void;
  className?: string;
}) {
  const { content, reasoning, status } = useStream(message._id, isStreamed);

  const isCurrentlyStreaming = useMemo(() => {
    if (!isStreamed) return false;
    return status === "pending" || status === "streaming";
  }, [isStreamed, status]);

  useEffect(() => {
    if (!isStreamed) return;
    if (isCurrentlyStreaming) return;
    stopStreaming();
  }, [isStreamed, isCurrentlyStreaming, stopStreaming]);

  const currentContent = (message?.content?.length ?? 0 > content.length) ? message?.content : content;
  const currentReasoning =
    (message?.reasoning?.length ?? 0) > (reasoning?.length ?? 0) ? message?.reasoning : reasoning;
  const isLoading = message.status === "pending" || (message.status === "generating" && status === "pending");

  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (message?.content || message?.reasoning) {
      updateListMargin(messageRef);
    }
  }, [currentContent, currentReasoning]);

  return (
    <div className={cn("relative flex items-start", className)}>
      <AssistantMessageWrapper message={message}>
        <div ref={messageRef} className="message flex w-full max-w-full flex-1 grow-0 flex-col gap-4">
          {(message?.reasoning || reasoning) && (
            <ReasoningAccordion reasoning={currentReasoning} isReasoning={!!currentReasoning} />
          )}

          {isLoading ? (
            <div className="relative ml-1 h-5 w-10 overflow-hidden">
              <Loader />
            </div>
          ) : (
            <>
              {currentContent && <MessageContent markdown={currentContent} />}
              <MessageStatus
                status={message?.status}
                statusMessage={message?.status_message}
                cancelled={message?.cancelled}
              />
            </>
          )}

          {/* {Array.isArray(parsedAnnotations) && <Annotations annotations={parsedAnnotations} />} */}
        </div>
      </AssistantMessageWrapper>
    </div>
  );
}
export const Assistant = memo(AssistantComponent);
