"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Doc } from "@gen/dataModel";
import { api } from "@gen/api";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@/lib/convex/use-mutation";
import { getErrorMessage } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Doc<"chats">;
}

export function RenameChatDialog({ open, onOpenChange, chat }: DialogProps) {
  const [title, setTitle] = useState(chat?.title ?? "");

  useEffect(() => {
    if (open) {
      setTitle(chat?.title ?? "");
    }
  }, [open, chat?.title]);

  const renameChat = useMutation(api.chat.update.renameChat, {
    onError(e) {
      toast.error("Could not rename the chat", { description: getErrorMessage(e) });
    },
    onSuccess() {
      onOpenChange(false);
    },
  });

  const handleRename = () => {
    if (title.trim().length === 0) {
      toast.error("Could not rename the chat", { description: "Title cannot be empty" });
      return;
    }
    if (title.trim() === chat?.title) return;

    renameChat.mutate({ chatId: chat._id, newTitle: title });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRename();
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <Input
            value={title}
            onInput={(e) => setTitle(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="bg-accent ring-offset-muted rounded-full px-4 text-white"
            placeholder="Enter a new title..."
          />
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={renameChat.isPending}>
              {renameChat.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteChatDialog({ open, onOpenChange, chat }: DialogProps) {
  const { chatId } = useParams();
  const router = useRouter();

  const deleteChat = useMutation(api.chat.delete.one, {
    onError(e) {
      toast.error("Could not delete the chat", { description: getErrorMessage(e) });
    },
    onSuccess(result) {
      onOpenChange(false);
      router.push("/");
    },
  });

  const handleDelete = async () => {
    await deleteChat.mutate({ chat: chat._id });
  };

  const title = chat?.title && chat?.title?.trim()?.length > 0 ? chat?.title?.trim() : chat?.prompt_short;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleDelete();
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>Are you sure you want to delete this chat?</DialogDescription>
          </DialogHeader>
          <div className="bg-accent my-2 flex h-10 w-full max-w-full items-center gap-2 overflow-hidden rounded-full px-5 font-medium text-white">
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="grow-0 overflow-hidden text-sm text-ellipsis whitespace-nowrap">{title}</span>
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" type="submit" disabled={deleteChat.isPending}>
              {deleteChat.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
