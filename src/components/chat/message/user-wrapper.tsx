import React, { Fragment, ReactNode, useCallback, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, FileIcon, Plus, X } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Doc } from "@gen/dataModel";
import UserMessageFooter from "./user-footer";

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
    <>
      <div
        className={cn(
          "group relative flex w-fit max-w-[85%] flex-col items-end justify-center gap-1 self-end rounded-4xl px-2",
          messageIsHidden && "opacity-60",
        )}
      >
        <div
          className={cn(
            "bg-card relative flex w-full max-w-full items-start self-end rounded-4xl px-2",
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
        {message && <UserMessageFooter message={message} />}
      </div>
    </>
  );
});
