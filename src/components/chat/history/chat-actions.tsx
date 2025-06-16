"use client";

import { isMobile } from "react-device-detect";
import { Ellipsis, Pin, PinOff, TextCursor, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Menu, MenuItemType, MenuType } from "@/components/ui/menu";
import { useMutation } from "@/lib/convex/use-mutation";
import { api } from "@gen/api";
import { Id } from "@gen/dataModel";

interface ChatActionsProps {
  onRename: () => void;
  onDelete: () => void;
  isActive: boolean;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPinned: boolean;
  chatId: Id<"chats">;
}

export function ChatActions({ onRename, onDelete, isActive, menuOpen, isPinned, chatId }: ChatActionsProps) {
  const menuItems = useChatItemActions({ isPinned, onDelete, onRename, chatId });

  const trigger = (
    <div
      className={cn(
        "text-primary/50 hover:text-primary absolute top-0 right-0 z-30 flex h-full w-11 items-center justify-center opacity-0 transition-[color,opacity] group-hover:opacity-100", // Added z-30
        menuOpen && "opacity-100",
        isActive && "opacity-100",
      )}
    >
      <Ellipsis className="h-5 w-5" />
    </div>
  );

  return (
    <Menu onTrigger={() => {}} items={menuItems} context menuType={isMobile ? MenuType.Drawer : MenuType.Dropdown}>
      {trigger}
    </Menu>
  );
}

export function useChatItemActions({
  isPinned,
  onRename,
  onDelete,
  chatId,
}: {
  isPinned: boolean;
  onRename: () => void;
  onDelete: () => void;
  chatId: Id<"chats">;
}) {
  const pin = useMutation(api.chat.update.pinChat);

  return [
    {
      type: MenuItemType.Item,
      content: isPinned ? (
        <div className="flex items-center gap-2">
          <PinOff className="text-primary/80 size-4" strokeWidth={2.5} /> Unpin
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Pin className="text-primary/80 size-4" strokeWidth={2.5} /> Pin
        </div>
      ),
      onSelect: () => pin.mutate({ chatId, pin: !isPinned }),
    },
    {
      type: MenuItemType.Item,
      content: (
        <div className="flex items-center gap-2">
          <TextCursor className="text-primary/80 size-4" strokeWidth={2.5} /> Rename
        </div>
      ),
      onSelect: () => onRename(),
    },
    {
      type: MenuItemType.Item,
      variant: "destructive",
      content: (
        <div className="flex items-center gap-2 text-red-500">
          <Trash2 className="size-4 text-red-500" strokeWidth={2.5} /> Delete
        </div>
      ),
      onSelect: () => onDelete(),
    },
  ];
}
