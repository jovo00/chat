"use client";

import { Button } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { ArrowUp, LoaderCircle, Square } from "lucide-react";
import { FormEvent, KeyboardEventHandler, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ModelSelect from "./model-select";
import { api } from "@gen/api";
import useSendMessage from "@/lib/chat/use-send-message";
import { Doc, Id } from "@gen/dataModel";
import useChatState from "@/lib/state/chat";
import { Preloaded } from "@/lib/convex/use-preload";
import { useMutation } from "@/lib/convex/use-mutation";
import { toast } from "sonner";
import { useQuery } from "@/lib/convex/use-query";

export default function ChatInput({
  preloadedModels,
  chatId,
  lastModelState,
}: {
  preloadedModels: Preloaded<typeof api.models.get.many>;
  chatId?: Id<"chats">;
  lastModelState?: Doc<"models">;
}) {
  const textInput = useRef<HTMLTextAreaElement>(null);
  const streams = useChatState((state) => state.streaming);
  const messages = useSendMessage(chatId);
  const { data: chat } = useQuery(api.chat.get.chat, chatId ? { chatId } : "skip");
  const [cancelling, setCancelling] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const streaming = chatId && streams.has(chatId);
  const isGenerating =
    streaming || chat?.latest_message_status === "generating" || chat?.latest_message_status === "pending";

  async function submitHandler(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!textInput.current) return;
    if (isGenerating) return;

    setSubmitting(true);
    setCancelling(false);

    const prompt = textInput.current?.value;
    if (!prompt || !prompt?.trim()) return;

    textInput.current.value = "";

    await messages.send(prompt);
  }

  useEffect(() => {
    if (!isGenerating) {
      setSubmitting(false);
    }
  }, [isGenerating]);

  const onKeyDownHandler: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e?.shiftKey) {
      submitHandler(e);
    }
  };

  const cancelMessage = useMutation(api.chat.update.cancel, {
    onError(e) {
      setCancelling(false);
      toast.error("Could not cancel the generation", {
        description: getErrorMessage(e),
      });
    },
  });

  async function stopHandler() {
    if (!isGenerating) return;
    if (!chatId) return;

    if (streaming) {
      setCancelling(true);
      const messages = streams.get(chatId);
      if (!messages) return;

      await Promise.allSettled(
        Array.from(messages).map((message) => {
          return cancelMessage.mutate({ messageId: message });
        }),
      );
    } else if (chat?.latest_message) {
      setCancelling(true);
      return cancelMessage.mutate({ messageId: chat?.latest_message });
    }
  }

  return (
    <form className="w-full px-2 lg:px-4" onSubmit={submitHandler}>
      <div
        className={cn(
          "bg-input relative mx-auto flex w-full max-w-240 grow flex-col gap-4 overflow-hidden rounded-t-md p-5 pb-3",
        )}
      >
        <TextareaAutosize
          ref={textInput}
          className="placeholder:text-secondary-foreground/60 max-h-6 w-full resize-none text-base outline-none"
          placeholder="Type your message here"
          onKeyDown={onKeyDownHandler}
          cacheMeasurements
          minRows={1}
          maxRows={10}
          onFocus={(e) => e.currentTarget.classList.remove("max-h-6")}
          autoFocus
        ></TextareaAutosize>

        <div className="flex w-full items-center justify-between">
          <ModelSelect small preloadedModels={preloadedModels} lastModelState={lastModelState} />
          <Button
            type={streaming ? "button" : "submit"}
            size="icon"
            variant="secondary"
            className="size-10 rounded-full"
            onClick={stopHandler}
            disabled={cancelMessage.isPending || submitting || cancelling}
          >
            {submitting || isGenerating ? (
              cancelMessage.isPending || cancelling || submitting ? (
                <LoaderCircle className="repeat-infinite size-4 animate-spin" />
              ) : (
                <Square className="size-4" />
              )
            ) : (
              <ArrowUp className="size-5" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
