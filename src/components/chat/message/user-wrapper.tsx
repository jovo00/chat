import React, { Fragment, ReactNode, useCallback, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, FileIcon, Plus, X } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Doc } from "@gen/dataModel";

export const UserWrapper = React.memo(function UserMessage({
  message,
  children,
}: {
  message?: Doc<"messages">;
  children: ReactNode;
}) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 0 });
  const params = useParams();
  const chatId = params?.id as string;

  const messageIsHidden = message?.hide;

  const handleCopy = () => {
    const partialSelection = window.getSelection()?.toString();
    if (partialSelection) {
      copyToClipboard(partialSelection);
    } else if (message?.prompt) {
      copyToClipboard(message.prompt);
    }
  };

  const handleToggleContext = () => {
    // if (message) {
    //   updateMessageContext.mutate({ hide: !message.hide });
    // }
  };

  return (
    <div
      className={cn(
        "group bg-card relative flex w-fit max-w-[85%] items-start self-end rounded-4xl px-2",
        messageIsHidden && "opacity-60",
      )}
    >
      {messageIsHidden ? (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="user-message" className="w-full border-none px-4">
            <AccordionTrigger className="flex items-center justify-between hover:no-underline">
              <span className="flex items-center gap-2 pr-4 text-left">
                <X className="inline size-4 shrink-0" /> Message removed from context
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex w-full flex-1 flex-col p-4 pt-1 text-base hyphens-auto">
              {children}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="flex w-full flex-1 flex-col gap-2 p-4 text-base hyphens-auto">{children}</div>
      )}
    </div>
    // <ContextMenuContent className="rounded-[1.2rem] p-1">
    //   <ContextMenuItem className="flex items-center gap-2 rounded-full" onClick={handleCopy}>
    //     <Copy className="size-3" /> Copy
    //   </ContextMenuItem>
    //   <ContextMenuItem className="flex items-center gap-2 rounded-full" onClick={handleToggleContext}>
    //     {messageIsHidden ? <Plus className="size-3" /> : <X className="size-3" />}
    //     {messageIsHidden ? "Add to context" : "Remove from context"}
    //   </ContextMenuItem>
    // </ContextMenuContent>
  );
});
