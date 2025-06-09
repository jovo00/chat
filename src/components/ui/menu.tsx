"use client";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useRef, useState } from "react";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

export enum MenuItemType {
  Item,
  Separator,
  Sub,
  Checkbox,
  RadioGroup,
  RadioItem,
  Label,
}

export enum MenuType {
  Context,
  Dropdown,
  Drawer,
}

export type MenuItem = {
  type: MenuItemType;
  content?: string | React.ReactNode;
  width?: number;
  items?: MenuItem[];
  variant?: "default" | "destructive";
  checked?: boolean;
  inset?: boolean;
  value?: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: string) => void;
};

export type MenuDefinition = MenuItem[];

function renderContextMenuItems(items: MenuDefinition): React.ReactNode {
  return items.map((item, idx) => {
    switch (item.type) {
      case MenuItemType.Separator:
        return <ContextMenuSeparator key={idx} />;
      case MenuItemType.Label:
        return (
          <ContextMenuLabel key={idx} inset={item.inset}>
            {item.content}
          </ContextMenuLabel>
        );
      case MenuItemType.Item:
        return (
          <ContextMenuItem
            key={idx}
            inset={item.inset}
            disabled={item.disabled}
            variant={item.variant}
            onClick={() => item.onSelect?.()}
          >
            {item.content}
            {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
          </ContextMenuItem>
        );
      case MenuItemType.Checkbox:
        return (
          <ContextMenuCheckboxItem
            key={idx}
            checked={item.checked}
            onCheckedChange={(checked) => item.onCheckedChange?.(checked)}
            disabled={item.disabled}
          >
            {item.content}
            {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
          </ContextMenuCheckboxItem>
        );
      case MenuItemType.RadioGroup:
        return (
          <ContextMenuRadioGroup key={idx} value={item.value} onValueChange={(value) => item.onValueChange?.(value)}>
            {renderContextMenuItems(item.items || [])}
          </ContextMenuRadioGroup>
        );
      case MenuItemType.RadioItem:
        return (
          <ContextMenuRadioItem key={idx} value={item.value!} disabled={item.disabled}>
            {item.content}
            {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
          </ContextMenuRadioItem>
        );
      case MenuItemType.Sub:
        return (
          <ContextMenuSub key={idx}>
            <ContextMenuSubTrigger inset={item.inset}>{item.content}</ContextMenuSubTrigger>
            <ContextMenuSubContent className={item.width ? `w-[${item.width}px]` : undefined}>
              {renderContextMenuItems(item.items || [])}
            </ContextMenuSubContent>
          </ContextMenuSub>
        );
      default:
        return null;
    }
  });
}

function renderDropdownMenuItems(items: MenuDefinition): React.ReactNode {
  return items.map((item, idx) => {
    switch (item.type) {
      case MenuItemType.Separator:
        return <DropdownMenuSeparator key={idx} />;
      case MenuItemType.Label:
        return (
          <DropdownMenuLabel key={idx} inset={item.inset}>
            {item.content}
          </DropdownMenuLabel>
        );
      case MenuItemType.Item:
        return (
          <DropdownMenuItem
            key={idx}
            inset={item.inset}
            disabled={item.disabled}
            variant={item.variant}
            onClick={() => item.onSelect?.()}
          >
            {item.content}
            {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        );
      case MenuItemType.Checkbox:
        return (
          <DropdownMenuCheckboxItem
            key={idx}
            checked={item.checked}
            disabled={item.disabled}
            onCheckedChange={(checked) => item.onCheckedChange?.(checked)}
          >
            {item.content}
            {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
          </DropdownMenuCheckboxItem>
        );
      case MenuItemType.RadioGroup:
        return (
          <DropdownMenuRadioGroup key={idx} value={item.value} onValueChange={(value) => item.onValueChange?.(value)}>
            {renderDropdownMenuItems(item.items || [])}
          </DropdownMenuRadioGroup>
        );
      case MenuItemType.RadioItem:
        return (
          <DropdownMenuRadioItem key={idx} value={item.value!} disabled={item.disabled}>
            {item.content}
            {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
          </DropdownMenuRadioItem>
        );
      case MenuItemType.Sub:
        return (
          <DropdownMenuSub key={idx}>
            <DropdownMenuSubTrigger inset={item.inset}>{item.content}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className={item.width ? `w-[${item.width}px]` : undefined}>
              {renderDropdownMenuItems(item.items || [])}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      default:
        return null;
    }
  });
}

function renderDrawerMenuItems(items: MenuDefinition, setOpen: (open: boolean) => void): React.ReactNode {
  return items.map((item, idx) => {
    switch (item.type) {
      case MenuItemType.Separator:
        return (
          <div className="flex h-2 w-full items-center" key={idx}>
            <div className="w-full border-b"></div>
          </div>
        );
      case MenuItemType.Label:
        return (
          <div key={idx} className={cn("font-bold", item.inset && "pl-5")}>
            {item.content}
          </div>
        );
      case MenuItemType.Item:
        return (
          <Button
            key={idx}
            disabled={item.disabled}
            variant={item.variant === "destructive" ? "destructive-ghost" : item.variant ?? "ghost"}
            className={"mx-2 justify-start"}
            onClick={() => {
              item.onSelect?.();
              setOpen(false);
            }}
          >
            {item.content}
          </Button>
        );
      case MenuItemType.Checkbox:
        return (
          <Button key={idx} disabled={item.disabled} variant={item.variant ?? "ghost"} className="mx-2 justify-start">
            <Checkbox
              key={idx}
              checked={item.checked}
              id={item.value!}
              disabled={item.disabled}
              onCheckedChange={(checked) => {
                item.onCheckedChange?.(checked as boolean);
              }}
            ></Checkbox>
            <Label htmlFor={item.value!}>{item.content}</Label>
          </Button>
        );
      case MenuItemType.RadioGroup:
        return (
          <RadioGroup key={idx} value={item.value} onValueChange={(value) => item.onValueChange?.(value)}>
            <div className="flex flex-col gap-4 px-6 py-4">{renderDrawerMenuItems(item.items || [], setOpen)}</div>
          </RadioGroup>
        );
      case MenuItemType.RadioItem:
        return (
          <div className="flex cursor-pointer items-center gap-2">
            <RadioGroupItem value={item.value!} id={item.value!} />
            <Label htmlFor={item.value!}>{item.content}</Label>
          </div>
        );
      case MenuItemType.Sub:
        return (
          <div key={idx} className="flex flex-col">
            <div className={cn("px-6 py-2 font-bold", item.inset && "px-5")}>{item.content}</div>
            <div className="flex flex-col">{renderDrawerMenuItems(item.items || [], setOpen)}</div>
          </div>
        );
      default:
        return null;
    }
  });
}

export function Menu({
  menuType,
  onTrigger,
  children,
  items,
  title,
  context,
  align,
  ...props
}: {
  menuType: MenuType;
  children: React.ReactNode;
  onTrigger: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  items: MenuDefinition;
  context?: boolean;
  title?: React.ReactNode;
  align?: "start" | "center" | "end";
} & any) {
  if (menuType === MenuType.Context) {
    return (
      <ContextMenu modal={true}>
        <ContextMenuTrigger asChild onContextMenu={onTrigger} {...props}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">{renderContextMenuItems(items)}</ContextMenuContent>
      </ContextMenu>
    );
  } else if (menuType === MenuType.Dropdown) {
    return <RenderDropdown onTrigger={onTrigger} items={items} children={children} align={align} {...props} />;
  } else if (menuType === MenuType.Drawer) {
    return (
      <RenderDrawer
        onTrigger={onTrigger}
        items={items}
        context={context}
        children={children}
        title={title}
        {...props}
      />
    );
  }
}

export function RenderDropdown({
  onTrigger,
  children,
  items,
  align,
  ...props
}: {
  children: React.ReactNode;
  onTrigger: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  items: MenuDefinition;
  align?: "start" | "center" | "end";
} & any) {
  const element = useRef(null);
  return (
    <DropdownMenu
      modal={true}
      onOpenChange={() => onTrigger({ currentTarget: element.current, target: element.current })}
    >
      <DropdownMenuTrigger asChild ref={element} {...props}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52" align={align}>
        {renderDropdownMenuItems(items)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RenderDrawer({
  onTrigger,
  children,
  items,
  title,
  context,
  ...props
}: {
  children: React.ReactNode;
  onTrigger: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  items: MenuDefinition;
  context?: boolean;
  title: React.ReactNode;
} & any) {
  const [open, setOpen] = useState(false);
  const element = useRef(null);
  return (
    <Drawer
      modal={true}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        onTrigger({ currentTarget: element.current, target: element.current });
      }}
    >
      {context ? (
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          {children}
        </div>
      ) : (
        <DrawerTrigger asChild ref={element} {...props}>
          {children}
        </DrawerTrigger>
      )}
      <DrawerContent className="pb-3">
        <DrawerHeader className="mb-2 border-b px-6">
          <DrawerTitle className="text-base">{title}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-1 overflow-y-auto pt-2">{renderDrawerMenuItems(items, setOpen)}</div>
      </DrawerContent>
    </Drawer>
  );
}

export const demoItems: MenuDefinition = [
  { type: MenuItemType.Item, content: "Kopieren", onSelect: () => console.log("copy") },
  { type: MenuItemType.Item, content: "Umbenennen", onSelect: () => console.log("rename") },
  { type: MenuItemType.Separator },
  {
    type: MenuItemType.Sub,
    content: "Mehr",
    width: 5,
    items: [
      { type: MenuItemType.Item, content: "Teilen", onSelect: () => console.log("share") },
      { type: MenuItemType.Item, content: "Per E-Mail versenden", onSelect: () => console.log("email") },
    ],
  },
  { type: MenuItemType.Separator },
  { type: MenuItemType.Item, content: "Delete", variant: "destructive", onSelect: () => console.log("delete") },
  { type: MenuItemType.Separator },
  {
    type: MenuItemType.Checkbox,
    value: "checkbox",
    content: "Checkbox",
    checked: true,
    onCheckedChange: (checked) => console.log(checked),
  },
  {
    type: MenuItemType.Checkbox,
    value: "something-else",
    content: "Something Else",
    checked: false,
    onCheckedChange: (checked) => console.log(checked),
  },
  { type: MenuItemType.Separator },
  {
    type: MenuItemType.RadioGroup,
    content: "Select",
    value: "pedro",
    onValueChange: (value) => console.log(value),
    items: [
      { type: MenuItemType.Label, content: "Person", inset: true },
      { type: MenuItemType.RadioItem, value: "pedro", content: "Pedro Duarte" },
      { type: MenuItemType.RadioItem, value: "colm", content: "Colm Tuite" },
    ],
  },
];
