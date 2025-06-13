"use client";

import { api } from "@gen/api";
import { Id } from "@gen/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import useInputState from "../state/input";
import { useRouter } from "next/navigation";
import useChatState from "../state/chat";

export default function useSendMessage(chatId?: Id<"chats">) {
  const model = useInputState((state) => state.model);
  const addDrivenId = useChatState((state) => state.addDrivenId);
  const setStreaming = useChatState((state) => state.setStreaming);
  const router = useRouter();

  const sendMessage = useMutation(api.chat.create.one);

  const send = useCallback(
    async (prompt: string) => {
      if (!model) throw new Error("No model selected");

      const data = await sendMessage({
        prompt,
        model,
        chat: chatId,
      });

      addDrivenId(data?.messageId);
      setStreaming(true);

      router.push("/chat/" + data.chatId);
    },
    [model, sendMessage],
  );

  return { send };
}
