"use client";

import { getErrorMessage, updateListMargin } from "@/lib/utils";
import { Doc, Id } from "@gen/dataModel";
import { useEffect, memo, useRef } from "react";
import MessageContent from "../content";
import { UserMessageLayout } from "./layout";
import { X } from "lucide-react";
import getIcon from "@/lib/file-icons/get-icon";
import { useConvex } from "convex/react";
import { toast } from "sonner";
import { api } from "@gen/api";

function UserMessageContentComponent({
  message,
  className,
}: {
  message: Doc<"messages"> & { files: Id<"files">[] | Doc<"files">[] };
  className?: string;
}) {
  const convex = useConvex();
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (message?.prompt) {
      updateListMargin(messageRef);
    }
  }, [message?.prompt]);

  async function openFile(file: Doc<"files">) {
    try {
      const fullFile = await convex.query(api.files.get.url, { file: file._id });
      if (!fullFile?.url) {
        toast.error("Could not get the file url");
        return;
      }

      window.open(fullFile.url, "_blank");
    } catch (err) {
      toast.error("Could not get the file url", { description: getErrorMessage(err as Error) });
    }
  }

  return (
    <UserMessageLayout message={message}>
      <div ref={messageRef} className="flex w-full max-w-full flex-1 grow-0 flex-col">
        {(message?.files?.length ?? 0) > 0 && (
          <div className="mb-2 flex w-full flex-wrap gap-1">
            {message?.files
              ?.filter((f) => typeof f === "object")
              ?.map((f) => {
                const file = f as Doc<"files">;
                return (
                  <a
                    onClick={async () => file?._id !== "deleted" && (await openFile(file))}
                    key={file._id}
                    className="bg-accent flex max-w-56 cursor-pointer items-center gap-1 rounded-full py-1 pr-3 pl-1 transition-colors hover:bg-white/10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full">
                      {file?._id === "deleted" ? (
                        <X className="size-4 opacity-50" />
                      ) : (
                        <img src={getIcon(file?.name, false)} className="size-4" />
                      )}
                    </div>

                    {file?._id !== "deleted" && (
                      <div className="w-full overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
                        {file.name}
                      </div>
                    )}
                    {file?._id === "deleted" && (
                      <div className="w-full overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap opacity-50">
                        Deleted File
                      </div>
                    )}
                  </a>
                );
              })}
          </div>
        )}
        <span className="message">{message?.prompt && <MessageContent markdown={message?.prompt} isUser />}</span>
      </div>
    </UserMessageLayout>
  );
}
export const UserMessageContent = memo(UserMessageContentComponent);
