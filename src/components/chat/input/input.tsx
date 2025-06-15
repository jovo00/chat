"use client";

import { Button } from "@/components/ui/button";
import { cn, getErrorMessage } from "@/lib/utils";
import { ArrowUp, Globe, LoaderCircle, Paperclip, Square } from "lucide-react";
import { FormEvent, FormEventHandler, KeyboardEventHandler, useEffect, useMemo, useRef, useState } from "react";
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
import { useFileAttachments } from "@/lib/chat/use-file-attachments";
import Dropzone from "@/components/ui/dropzone";
import AttachedFiles from "./attached-files";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import useInputState from "@/lib/state/input";

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
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(false);
  const {
    attachedFiles,
    resetAttachments,
    pending,
    handleFileDrop,
    handleFileInputChange,
    removeFile,
    MAX_FILE_COUNT,
  } = useFileAttachments();
  const selectedModel = useInputState((state) => state.model);
  const addOptimisticPrompt = useInputState((state) => state.addOptimisticPrompt);
  const { data: currentModel } = useQuery(api.models.get.one, selectedModel ? { model: selectedModel } : "skip");
  const messages = useSendMessage(enableSearchGrounding, attachedFiles, chatId);
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
    if (pending > 0) return;
    if (!currentModel) return;

    const prompt = textInput.current?.value;
    if (!prompt || !prompt?.trim()) return;

    setSubmitting(true);
    setCancelling(false);

    chatId && addOptimisticPrompt(chatId, currentModel, prompt?.trim(), attachedFiles);

    await messages.send(prompt);

    textInput.current.value = "";
    resetAttachments();
  }

  useEffect(() => {
    setSubmitting(false);
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

  const allowedFiletypes = useMemo(() => {
    if (!currentModel) return [];

    const filetypes = [];
    if (currentModel.text_capabilities?.features.file_input) {
      filetypes.push(".pdf");
    }
    if (currentModel.text_capabilities?.features.image_input) {
      filetypes.push(".jpg");
      filetypes.push(".png");
      filetypes.push(".webp");
      filetypes.push(".jpeg");
    }

    return filetypes;
  }, [currentModel]);

  return (
    <form className="w-full px-2 lg:px-4" onSubmit={submitHandler}>
      {allowedFiletypes?.length > 0 && <Dropzone onDrop={(files) => handleFileDrop(files, allowedFiletypes)} />}
      <div
        className={cn(
          "bg-input relative mx-auto flex w-full max-w-240 grow flex-col gap-4 overflow-hidden rounded-t-md p-5 pb-3",
        )}
      >
        <AttachedFiles files={attachedFiles} onRemove={removeFile} />

        <TextareaAutosize
          ref={textInput}
          className="placeholder:text-secondary-foreground/60 w-full resize-none text-base outline-none"
          placeholder="Type your message here"
          onKeyDown={onKeyDownHandler}
          cacheMeasurements
          minRows={2}
          maxRows={10}
          // onFocus={(e) => e.currentTarget.classList.remove("max-h-6")}
          autoFocus
        ></TextareaAutosize>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <ModelSelect small preloadedModels={preloadedModels} lastModelState={lastModelState} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={"relative"}
                  type="button"
                  variant={enableSearchGrounding ? "default" : "secondary"}
                  size={"icon"}
                  onClick={() => setEnableSearchGrounding((prev) => !prev)}
                >
                  <span className="sr-only">Enable search grounding</span>
                  <Globe className="size-4.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enable search grounding</TooltipContent>
            </Tooltip>

            {allowedFiletypes?.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="relative" type="button" variant={"secondary"} size={"icon"}>
                    <input
                      type="file"
                      className="absolute top-0 left-0 z-50 h-full w-full cursor-pointer opacity-0"
                      accept={allowedFiletypes.join(",")}
                      onInput={handleFileInputChange as FormEventHandler}
                      title=""
                    />
                    <span className="sr-only">Attach Files</span>
                    <Paperclip className="size-4.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add an attachment</TooltipContent>
              </Tooltip>
            )}
          </div>
          <Button
            type={streaming ? "button" : "submit"}
            size="icon"
            variant="secondary"
            className="size-10 rounded-full"
            onClick={stopHandler}
            disabled={cancelMessage.isPending || submitting || cancelling || pending > 0}
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
