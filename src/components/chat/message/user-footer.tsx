import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Doc, Id } from "@gen/dataModel";
import { CheckCircle2, CopyIcon } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

export default function UserMessageFooter({
  message,
}: {
  message: Doc<"messages"> & { model: Id<"models"> | Doc<"models"> };
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1500 });

  return (
    <div className="flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
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
    </div>
  );
}
