"use client";

import { useSmoothText } from "@/lib/chat/use-smooth-text";
import { useStream } from "@/lib/chat/use-stream";
import { useAuthToken } from "@convex-dev/auth/react";
import { api } from "@gen/api";
import { Doc } from "@gen/dataModel";
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
  const { text, status } = useStream(message._id, isDriven);

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) return false;
    return status === "pending" || status === "streaming";
  }, [isDriven, status]);

  useEffect(() => {
    if (!isDriven) return;
    if (isCurrentlyStreaming) return;
    stopStreaming();
  }, [isDriven, isCurrentlyStreaming, stopStreaming]);

  const content = (message?.content?.length ?? 0 > text.length) ? message?.content : text;

  const smoothText = useSmoothText(content ?? "", { charsPerSec: 2048 });

  return (
    <div className="md-answer">
      <Markdown>{content ? (isDriven ? text : smoothText[0]) : "Thinking..."}</Markdown>
      {status === "error" && <div className="mt-2 text-red-500">Error loading response</div>}
    </div>
  );
}
