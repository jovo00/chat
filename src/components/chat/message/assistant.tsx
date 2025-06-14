"use client";

import Loader from "@/components/ui/loader";
import { useSmoothText } from "@/lib/chat/use-smooth-text";
import { useStream } from "@/lib/chat/use-stream";
import { useAuthToken } from "@convex-dev/auth/react";
import { api } from "@gen/api";
import { Doc } from "@gen/dataModel";
import { LoaderCircle } from "lucide-react";
import { useMemo, useEffect } from "react";
import Markdown from "react-markdown";

export function Assistant({
  message,
  isDriven,
  stopStreaming,
}: {
  message: Doc<"messages">;
  isDriven: boolean;
  stopStreaming: () => void;
}) {
  const { content, reasoning, status } = useStream(message._id, isDriven);

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) return false;
    return status === "pending" || status === "streaming";
  }, [isDriven, status]);

  useEffect(() => {
    if (!isDriven) return;
    if (isCurrentlyStreaming) return;
    stopStreaming();
  }, [isDriven, isCurrentlyStreaming, stopStreaming]);

  const currentContent = (message?.content?.length ?? 0 > content.length) ? message?.content : content;
  const currentReasoning =
    (message?.reasoning?.length ?? 0) > (reasoning?.length ?? 0) ? message?.reasoning : reasoning;

  return (
    <div className="md-answer">
      {currentReasoning && <div className="opacity-50">Reasoning: {currentReasoning}</div>}
      {message.status === "pending" || (message.status === "generating" && status === "pending") ? (
        <Loader />
      ) : (
        <Markdown>{currentContent}</Markdown>
      )}
      {status === "error" && <div className="mt-2 text-red-500">Error loading response</div>}
      {message.cancelled && <div className="mt-2 text-red-500">Generation stopped by the user</div>}
    </div>
  );
}
