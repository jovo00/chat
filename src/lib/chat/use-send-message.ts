"use client";

import { api } from "@gen/api";
import { Id } from "@gen/dataModel";
import { useCallback, useState } from "react";
import useInputState from "../state/input";
import { useRouter } from "next/navigation";
import useChatState from "../state/chat";
import { useMutation } from "../convex/use-mutation";
import { toast } from "sonner";
import { getErrorMessage } from "../utils";

export default function useSendMessage(chatId?: Id<"chats">) {
  const model = useInputState((state) => state.model);
  const addStreaming = useChatState((state) => state.addStreaming);
  const router = useRouter();

  const sendMessage = useMutation(api.chat.create.one, {
    onSuccess(result) {
      addStreaming(result?.chatId, result?.messageId);
      router.push("/chat/" + result.chatId);
    },
    onError(e) {
      toast.error("Could not send message", { description: getErrorMessage(e) });
    },
  });

  const send = useCallback(
    async (prompt: string) => {
      if (!model) throw new Error("No model selected");

      await sendMessage.mutate({
        prompt,
        model,
        chat: chatId,
      });
    },
    [model, sendMessage],
  );

  return { send };
}
