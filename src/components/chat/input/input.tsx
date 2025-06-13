"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, Square } from "lucide-react";
import { FormEvent, KeyboardEventHandler, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ModelSelect from "./model-select";
import { Preloaded } from "convex/react";
import { api } from "@gen/api";
import useSendMessage from "@/lib/chat/use-send-message";
import { Id } from "@gen/dataModel";
import useChatState from "@/lib/state/chat";

export default function ChatInput({
  preloadedModels,
  chatId,
}: {
  preloadedModels: Preloaded<typeof api.models.get.many>;
  chatId?: Id<"chats">;
}) {
  const textInput = useRef<HTMLTextAreaElement>(null);
  const streaming = useChatState((state) => state.streaming);
  const messages = useSendMessage(chatId);

  function submitHandler(e: FormEvent) {
    e.preventDefault();
    if (!textInput.current) return;

    const prompt = textInput.current?.value;
    if (!prompt || !prompt?.trim()) return;

    textInput.current.value = "";

    messages.send(prompt);
  }

  const onKeyDownHandler: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e?.shiftKey) {
      submitHandler(e);
    }
  };

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
          <div>
            <ModelSelect small preloadedModels={preloadedModels} />
          </div>
          <Button type="submit" size="icon" variant="secondary" className="size-10 rounded-full">
            {streaming ? <Square className="h-4 w-4" /> : <ArrowUp className="h-5 w-5" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
