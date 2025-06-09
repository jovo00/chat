"use client";

import Logo from "@/components/icons/logos/logo";
import { useEffect, useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowLeft, Key, LogOut, SquarePen, UserRoundCog, FilesIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";
import useMenuState from "@/lib/state/menu";
import { useCookieState, useMediaQuery } from "@/lib/hooks";
import MenuIcon from "@/components/icons/menu";
import { PreloadedUser } from "@/lib/auth/server";
import { usePreloadedQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { isServer } from "@/lib/state/server";

export default function Header({
  preloadedUser,
  lastDeviceState,
}: {
  preloadedUser: PreloadedUser;
  lastDeviceState: "mobile" | "desktop";
}) {
  const { user } = usePreloadedQuery(preloadedUser);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mobileMenuOpen = useMenuState((state) => state.open);
  const setMobileMenuOpen = useMenuState((state) => state.setOpen);
  const [deviceState, setDeviceState] = useCookieState("deviceState", lastDeviceState);
  const isDesktop = deviceState === "desktop";

  useMediaQuery("(min-width: 1024px)", (matches) => setDeviceState(matches ? "desktop" : "mobile"));

  return (
    <header
      className={cn(
        "relative w-full z-50 h-14 shrink-0 flex items-center justify-center px-2 lg:px-4 transition-[transform,opacity] duration-300",
        mobileMenuOpen && "translate-x-72 md:translate-x-80 opacity-60"
      )}
    >
      {mobileMenuOpen && (
        <div
          className="w-full h-full absolute left-0 top-0 z-50 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(false);
          }}
        ></div>
      )}

      {!isDesktop && !pathname?.startsWith("/settings") && (
        <Button
          variant={"link"}
          className="allow-event-propagation p-0 w-10 h-10 items-center justify-center flex"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <MenuIcon className="w-5 h-5" />
        </Button>
      )}

      {isDesktop && pathname?.startsWith("/settings") && (
        <div className="flex items-center font-medium">
          <Link href="/" className="allow-event-propagation">
            <Logo className="w-6 h-6" />
          </Link>
        </div>
      )}

      {!isDesktop && pathname?.startsWith("/settings") && (
        <div className="flex items-center font-special text-lg">
          <Link
            href="/"
            className="allow-event-propagation gap-3 rounded-full px-2 flex items-center justify-center font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Settings
          </Link>
        </div>
      )}

      {!pathname?.startsWith("/settings") && (
        <div
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            "allow-event-propagation transition-[margin] duration-300 w-24 text-lg bg-transparent border-none focus:ring-transparent font-bold",
            mobileMenuOpen && "ml-0"
          )}
        >
          Chat
        </div>
      )}

      <div className="allow-event-propagation ml-auto flex items-center gap-3">
        {pathname?.startsWith("/chat") && !pathname?.startsWith("/settings") && !isDesktop && (
          <Button
            variant={"ghost"}
            className={cn("w-9 h-9 mr-2 p-0 rounded-full", pathname === "/chat" && "opacity-50 stop-event-propagation")}
            asChild
          >
            <Link href={"/chat"}>
              <SquarePen
                className={cn("w-[1.2rem] h-[1.2rem] opacity-80 transition-opacity hover:opacity-100")}
                strokeWidth={1.5}
              />
            </Link>
          </Button>
        )}

        <Popover open={open} onOpenChange={(open) => setOpen(open)}>
          <PopoverTrigger>
            <Avatar className="ml-auto h-10 w-10 cursor-pointer">
              <AvatarImage src={user?.image} className="transition-opacity" />
              <AvatarFallback className="text-foreground/60 bg-accent font-medium select-none">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="border-none px-0 pt-3 pb-0 rounded-3xl" align="end" sideOffset={10}>
            <div className="flex gap-4 w-full items-center border-b pb-4 px-3">
              <Avatar className="ml-auto h-10 w-10 cursor-pointer">
                <AvatarImage src={user?.image} className="transition-opacity" />
                <AvatarFallback className="text-foreground/60 bg-accent font-medium select-none">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col w-full">
                <h5 className="font-medium text-base whitespace-nowrap max-w-40 overflow-hidden text-ellipsis">
                  {user?.name ?? user?.email?.split("@")[0]}
                </h5>
                <p className="font-medium text-xs text-foreground/50 whitespace-nowrap max-w-40 overflow-hidden text-ellipsis">
                  {user?.email}
                </p>
              </div>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="shrink-0 w-10 h-10 p-0 rounded-full"
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
              >
                <LogOut className="w-5 h-5 cursor-pointer" strokeWidth={1.5} />
              </Button>
            </div>
            <div className="py-1 px-1">
              <Button
                onClick={() => setOpen(false)}
                className="w-full justify-start gap-4 text-foreground/80 h-10 rounded-full"
                variant={"ghost"}
                asChild
              >
                <Link href="/settings/account">
                  <UserRoundCog className="w-4 h-4 opacity-70" strokeWidth={1.5} />
                  Account Settings
                </Link>
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="w-full justify-start gap-4 text-foreground/80 h-10 rounded-full"
                variant={"ghost"}
                asChild
              >
                <Link href="/settings/api-keys">
                  <Key className="w-4 h-4 opacity-70" strokeWidth={1.5} />
                  API Keys
                </Link>
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="w-full justify-start gap-4 text-foreground/80 h-10 rounded-full"
                variant={"ghost"}
                asChild
              >
                <Link href="/settings/files">
                  <FilesIcon className="w-4 h-4 opacity-70" strokeWidth={1.5} />
                  File Uploads
                </Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
