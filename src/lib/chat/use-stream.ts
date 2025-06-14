// adapted from https://github.com/get-convex/persistent-text-streaming/blob/main/src/react/index.ts

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Id } from "@gen/dataModel";
import { useAuthToken } from "@convex-dev/auth/react";
import { dataTypes, validDataTypes } from "../../../convex/chat/generate";

export type StreamStatus = "pending" | "done" | "error" | "streaming";

export function useStream(messageId: Id<"messages">, driven: boolean) {
  const authToken = useAuthToken();
  const [streamEnded, setStreamEnded] = useState(null as boolean | null);
  const streamStarted = useRef(false);

  const [content, setContent] = useState<string>("");
  const [reasoning, setReasoning] = useState<string | null>("");

  useEffect(() => {
    if (driven && messageId && !streamStarted.current) {
      void (async () => {
        const success = await startStreaming(
          messageId,
          (text) => {
            text.split("\n").forEach((part) => {
              if (!part) return;

              const decoded = decodeData(part);
              switch (decoded.dataType) {
                case dataTypes.CONTENT:
                  setContent((prev) => prev + decoded.data);
                  break;
                case dataTypes.REASONING:
                  setReasoning((prev) => prev + decoded.data);
                  break;
              }
            });
          },
          {
            Authorization: `Bearer ${authToken}`,
          },
        );
        setStreamEnded(success);
      })();

      return () => {
        streamStarted.current = true;
      };
    }
  }, [driven, messageId, setStreamEnded, streamStarted]);

  const body = useMemo(() => {
    let status: StreamStatus;
    if (streamEnded === null) {
      status = content.length > 0 ? "streaming" : "pending";
    } else {
      status = streamEnded ? "done" : "error";
    }
    return {
      content,
      reasoning,
      status: status as StreamStatus,
    };
  }, [content, reasoning, streamEnded]);

  return body;
}

async function startStreaming(
  messageId: Id<"messages">,
  onUpdate: (text: string) => void,
  headers: Record<string, string>,
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_CONVEX_ACTIONS_URL}/chat`);
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      messageId,
    }),
    headers: { "Content-Type": "application/json", ...headers },
  });
  // Adapted from https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  if (response.status === 205) {
    console.error("Stream already finished", response);
    return false;
  }
  if (!response.ok) {
    console.error("Failed to reach streaming endpoint", response);
    return false;
  }
  if (!response.body) {
    console.error("No body in response", response);
    return false;
  }
  const reader = response.body.getReader();
  while (true) {
    try {
      const { done, value } = await reader.read();
      if (done) {
        onUpdate(new TextDecoder().decode(value));
        return true;
      }
      onUpdate(new TextDecoder().decode(value));
    } catch (e) {
      console.error("Error reading stream", e);
      return false;
    }
  }
}

export const decodeData = (text: string) => {
  const separatorIndex = text.indexOf(":");

  if (separatorIndex === -1) {
    throw new Error("Failed to parse text");
  }

  const dataType = text.slice(0, separatorIndex);

  if (!validDataTypes.includes(dataType)) {
    throw new Error(`Failed to parse text. Invalid dataType ${dataType}.`);
  }

  const textValue = text.slice(separatorIndex + 1);
  const jsonValue = JSON.parse(textValue);

  switch (dataType) {
    case dataTypes.CONTENT:
      return { dataType, data: jsonValue as string };
    case dataTypes.REASONING:
      return { dataType, data: jsonValue as string };
    default:
      return { dataType: undefined, data: jsonValue };
  }
};
