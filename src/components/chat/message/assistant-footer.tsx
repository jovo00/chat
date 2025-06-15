import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Doc, Id } from "@gen/dataModel";
import { CheckCircle2, CopyIcon } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import ProviderLogo from "@/components/icons/logos/providers";

export default function AssistantMessageFooter({
  message,
}: {
  message: Doc<"messages"> & { model: Id<"models"> | Doc<"models"> };
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1500 });
  const model = message?.model as Doc<"models">;

  return (
    <div className="flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"ghost"} size={"icon"} onClick={() => copyToClipboard(message?.content ?? "")}>
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
      {typeof message?.model === "object" && (
        <div className="text-foreground/70 flex items-center gap-1.5 text-xs font-medium">
          <ProviderLogo api={model.api} apiId={model.api_id} className="size-4" />
          {model?.title}
        </div>
      )}
    </div>
  );
}
