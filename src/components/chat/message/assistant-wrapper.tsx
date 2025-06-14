"use client";

import { memo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Copy, Plus, X } from "lucide-react";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { Doc } from "@gen/dataModel";

function AssistantMessageWrapperComponent({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: Doc<"messages">;
}) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 0 });

  const handleToggleContext = () => {
    // if (message) {
    //   updateMessageContext.mutate({ hide: !message.hide });
    // }
  };

  const handleCopy = () => {
    const partialSelection = window.getSelection()?.toString();
    if (partialSelection) {
      copyToClipboard(partialSelection);
    } else if (message?.content) {
      copyToClipboard(message.content);
    }
  };

  if (message?.hide) {
    return (
      <ContextMenu>
        <ContextMenuTrigger className="w-[calc(100%-2rem)]">
          <Accordion
            type="single"
            collapsible
            className="group relative flex w-[calc(100%-1rem)] items-start opacity-60"
          >
            <AccordionItem value="user-message" className="w-full border-none px-4">
              <AccordionTrigger className="flex items-center justify-between pb-0 hover:no-underline">
                <span className="flex items-center gap-2 text-left">
                  <X className="size-4" /> Message removed from context
                </span>
              </AccordionTrigger>
              <AccordionContent className="w-full">{children}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </ContextMenuTrigger>
        <ContextMenuContent className="rounded-[1.2rem] p-1">
          <ContextMenuItem className="flex items-center gap-2 rounded-full" onClick={handleToggleContext}>
            <Plus className="size-3" /> Add to context
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">{children}</ContextMenuTrigger>
      <ContextMenuContent className="rounded-[1.2rem] p-1">
        <ContextMenuItem className="flex items-center gap-2 rounded-full" onClick={handleCopy}>
          <Copy className="size-3" /> Copy
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-2 rounded-full" onClick={handleToggleContext}>
          <X className="size-3" /> Remove from context
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const AssistantMessageWrapper = memo(AssistantMessageWrapperComponent);
