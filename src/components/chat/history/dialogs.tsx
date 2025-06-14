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
import { useMutation } from "convex/react";
import { api } from "@gen/api";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Doc<"chats">;
}

export function RenameChatDialog({ open, onOpenChange, chat }: DialogProps) {
  const [title, setTitle] = useState(chat?.title ?? "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(chat?.title ?? "");
    }
  }, [open, chat?.title]);

  const renameChat = useMutation(api.chat.update.renameChat);
  const handleRename = () => {
    if (title.trim().length === 0) {
      toast.error("Could not rename the chat", { description: "Title cannot be empty" });
      return;
    }
    if (title.trim() === chat?.title) return;

    setPending(true);

    try {
      renameChat({ chatId: chat._id, newTitle: title });
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error("Could not rename the chat", { description: err?.data });
      }
    }
    setPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={pending}>
            {pending ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteChatDialog({ open, onOpenChange, chat }: DialogProps) {
  const { chatId } = useParams();
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const deleteChat = useMutation(api.chat.delete.one);

  const handleDelete = async () => {
    setPending(true);

    try {
      await deleteChat({ chat: chat._id });
      router.push("/");
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error("Could not delete the chat", { description: err?.data });
      }
    }
    setPending(false);
  };

  const title = chat?.title && chat?.title?.trim()?.length > 0 ? chat?.title?.trim() : chat?.prompt_short;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogDescription>Are you sure you want to delete this chat?</DialogDescription>
        </DialogHeader>
        <div className="bg-accent my-2 flex h-10 w-full max-w-full items-center gap-2 overflow-hidden rounded-full px-5 font-medium text-white">
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="grow-0 overflow-hidden text-sm text-ellipsis whitespace-nowrap">{title}</span>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
