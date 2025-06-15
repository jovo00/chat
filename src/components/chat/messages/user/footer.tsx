import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Doc, Id } from "@gen/dataModel";
import { CheckCircle2, CopyIcon, Plus, X } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { useMutation } from "@/lib/convex/use-mutation";
import { api } from "@gen/api";

export default function UserMessageFooter({
  message,
}: {
  message: Doc<"messages"> & { model: Id<"models"> | Doc<"models"> };
}) {
  const updateMessageVisibility = useMutation(api.chat.update.messagePromptVisibility);

  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1500 });

  return (
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"ghost"} size={"icon"} onClick={() => copyToClipboard(message?.prompt ?? "")}>
            {!isCopied ? (
              <div className="opacity-60 transition-opacity duration-500 group-hover:opacity-100">
                <CopyIcon className="size-4 shrink-0" />
              </div>
            ) : (
              <div className="copy-check text-green-400 transition-opacity duration-500 group-hover:opacity-100">
                <CheckCircle2 className="size-5 shrink-0" strokeWidth={1.5} />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="pointer-events-none">
          Copy message
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() =>
              updateMessageVisibility.mutate({ messageId: message._id, hide_prompt: !message.hide_prompt })
            }
          >
            {message.hide_prompt ? (
              <div className="opacity-60 transition-opacity duration-500 group-hover:opacity-100">
                <Plus className="size-4 shrink-0" />
              </div>
            ) : (
              <div className="opacity-60 transition-opacity duration-500 group-hover:opacity-100">
                <X className="size-4 shrink-0" />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="pointer-events-none">
          {message.hide_prompt ? "Add message to context" : "Hide message from context"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
