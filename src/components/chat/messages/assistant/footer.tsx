import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Doc, Id } from "@gen/dataModel";
import { CheckCircle2, CopyIcon, Plus, X } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import ProviderLogo from "@/components/icons/logos/providers";
import { useMutation } from "@/lib/convex/use-mutation";
import { api } from "@gen/api";
import { cn } from "@/lib/utils";
import { isMobile } from "react-device-detect";
import useChatState from "@/lib/state/chat";

export default function AssistantMessageFooter({
  message,
}: {
  message: Doc<"messages"> & { model: Id<"models"> | Doc<"models"> };
}) {
  const updateMessageVisibility = useMutation(api.chat.update.messageContentVisibility);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1500 });
  const model = message?.model as Doc<"models">;
  const selected = useChatState((state) => state.selected);

  return (
    <div
      className={cn(
        "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
        isMobile && selected?.id === message._id && !selected.prompt && "opacity-100",
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() =>
              copyToClipboard(
                message?.status === "error" ? "Error: " + (message?.status_message ?? "") : (message?.content ?? ""),
              )
            }
          >
            {!isCopied ? (
              <div className="opacity-60 transition-opacity duration-500 group-hover:opacity-100">
                <CopyIcon className="size-4 shrink-0" />
              </div>
            ) : (
              <div className="copy-check text-green-800 transition-opacity duration-500 group-hover:opacity-100 dark:text-green-400">
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
              updateMessageVisibility.mutate({ messageId: message._id, hide_content: !message.hide_content })
            }
          >
            {message.hide_content ? (
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
          {message.hide_content ? "Add message to context" : "Hide message from context"}
        </TooltipContent>
      </Tooltip>
      {typeof message?.model === "object" && (
        <div className="text-foreground/70 ml-3 flex items-center gap-1.5 text-xs font-medium">
          <ProviderLogo api={model.api} apiId={model.api_id} className="size-4" />
          {model?.title}
        </div>
      )}
    </div>
  );
}
