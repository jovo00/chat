"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, Square } from "lucide-react";
import { FormEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ModelSelect from "./model-select";
import { Preloaded } from "convex/react";
import { api } from "@gen/api";

export default function ChatInput({ preloadedModels }: { preloadedModels: Preloaded<typeof api.models.get.many> }) {
  const supportsFiles = true;
  const supportsImages = true;
  const isGenerating = false;

  function submitHandler(e: FormEvent) {}

  function onInputHandler(e: FormEvent<HTMLTextAreaElement>) {
    // console.log(e);
  }

  return (
    <form className="w-full px-2 lg:px-4" onSubmit={submitHandler}>
      <div
        className={cn(
          "bg-input relative mx-auto flex w-full max-w-240 grow flex-col gap-4 overflow-hidden rounded-t-md p-5 pb-3",
        )}
      >
        <TextareaAutosize
          className="placeholder:text-secondary-foreground/60 max-h-6 w-full resize-none text-base outline-none"
          placeholder="Type your message here"
          onInput={onInputHandler}
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
            {isGenerating ? <Square className="h-4 w-4" /> : <ArrowUp className="h-5 w-5" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
