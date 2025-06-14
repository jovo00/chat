"use client";

import { isMobile } from "react-device-detect";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatActionsProps {
  onRename: () => void;
  onDelete: () => void;
  isActive: boolean;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatActions({ onRename, onDelete, isActive, menuOpen, onOpenChange }: ChatActionsProps) {
  const trigger = (
    <div
      className={cn(
        "absolute top-0 right-0 z-30 flex h-full w-11 items-center justify-center text-white/50 opacity-0 transition-[color,opacity] group-hover:opacity-100 hover:text-white", // Added z-30
        menuOpen && "opacity-100",
        isActive && "opacity-100",
      )}
    >
      <Ellipsis className="h-5 w-5" />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={menuOpen} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="bg-muted border-none p-2">
          <DrawerClose asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
              className="bg-accent text-accent-foreground focus:bg-accent/80 h-12"
            >
              <Pencil className="mr-2 h-3 w-4" /> Rename
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              variant={"destructive"}
              className="mt-2 h-12"
            >
              <Trash2 className="text-destructive mr-2 h-4 w-4" strokeWidth={1.5} /> Delete
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-[1.15rem] p-1" sideOffset={2} align="start" alignOffset={30}>
        <DropdownMenuItem
          className="rounded-full px-2"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
        >
          <Pencil className="mr-2 h-3 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-full px-2 text-red-500 focus:bg-red-500/10 focus:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4 text-red-500" strokeWidth={1.5} /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
