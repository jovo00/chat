"use client";

import Logo from "@/components/icons/logos/logo";
import { useEffect, useState } from "react";
import { cn, getErrorMessage, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowLeft, Key, LogOut, SquarePen, UserRoundCog, FilesIcon, LockIcon, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";
import useMenuState from "@/lib/state/menu";
import { useCookieState } from "@/lib/hooks/use-cookie-state";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import MenuIcon from "@/components/icons/menu";
import { PreloadedUser } from "@/lib/auth/server";
import { useAuthActions } from "@convex-dev/auth/react";
import { usePreloadedQuery } from "@/lib/convex/use-preload";

export default function Header({
  preloadedUser,
  lastDeviceState,
}: {
  preloadedUser: PreloadedUser;
  lastDeviceState: "mobile" | "desktop";
}) {
  const { data: user, error, isError } = usePreloadedQuery(preloadedUser);
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
        "relative z-50 flex h-14 w-full shrink-0 items-center justify-center px-2 transition-all duration-300 lg:px-4",
        mobileMenuOpen && "translate-x-72 opacity-60 md:translate-x-80",
      )}
    >
      {mobileMenuOpen && (
        <div
          className="pointer-events-auto absolute top-0 left-0 z-50 h-full w-full"
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(false);
          }}
        ></div>
      )}

      {!isDesktop && !pathname?.startsWith("/settings") && (
        <Button
          variant={"link"}
          className="allow-event-propagation flex h-10 w-10 items-center justify-center p-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      )}

      {isDesktop && pathname?.startsWith("/settings") && (
        <div className="flex items-center font-medium">
          <Link href="/" className="allow-event-propagation">
            <Logo className="h-6 w-6" />
          </Link>
        </div>
      )}

      {!isDesktop && pathname?.startsWith("/settings") && (
        <div className="font-special flex items-center text-lg">
          <Link
            href="/"
            className="allow-event-propagation flex items-center justify-center gap-3 rounded-full px-2 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            Settings
          </Link>
        </div>
      )}

      {!pathname?.startsWith("/settings") && (
        <div
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            "allow-event-propagation w-24 border-none bg-transparent text-lg font-bold transition-[margin] duration-300 focus:ring-transparent",
            mobileMenuOpen && "ml-0",
          )}
        >
          Chat
        </div>
      )}

      <div className="allow-event-propagation ml-auto flex items-center gap-3">
        {pathname?.startsWith("/chat") && !pathname?.startsWith("/settings") && !isDesktop && (
          <Button
            variant={"ghost"}
            className={cn("mr-2 h-9 w-9 rounded-full p-0", pathname === "/chat" && "stop-event-propagation opacity-50")}
            asChild
          >
            <Link href={"/"}>
              <SquarePen
                className={cn("h-[1.2rem] w-[1.2rem] opacity-80 transition-opacity hover:opacity-100")}
                strokeWidth={1.5}
              />
            </Link>
          </Button>
        )}

        <Popover open={open} onOpenChange={(open) => setOpen(open)}>
          <PopoverTrigger>
            <Avatar className="ml-auto h-10 w-10 cursor-pointer">
              <AvatarImage src={user?.image} className="transition-opacity" />
              <AvatarFallback
                className={cn("text-foreground/60 bg-accent font-medium select-none", isError && "text-red-500")}
              >
                {isError ? <AlertCircle className="size-4" /> : getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="bg-card rounded-3xl border-none px-0 pt-3 pb-0" align="end" sideOffset={10}>
            <div className="flex w-full items-center gap-4 border-b px-3 pb-4">
              <Avatar className="ml-auto h-10 w-10 cursor-pointer">
                <AvatarImage src={user?.image} className="transition-opacity" />
                <AvatarFallback
                  className={cn("text-foreground/60 bg-accent font-medium select-none", isError && "text-red-500")}
                >
                  {isError ? <AlertCircle className="size-4" /> : getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex w-full flex-col">
                <h5
                  className={cn(
                    "max-w-40 overflow-hidden text-base font-medium text-ellipsis whitespace-nowrap",
                    isError && "text-red-500",
                  )}
                >
                  {isError ? "Error" : (user?.name ?? user?.email?.split("@")[0])}
                </h5>
                <p
                  className={cn(
                    "text-foreground/50 max-w-40 overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap",
                    isError && "text-red-500",
                  )}
                >
                  {isError ? getErrorMessage(error) : user?.email}
                </p>
              </div>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="h-10 w-10 shrink-0 rounded-full p-0"
                onClick={async () => {
                  await signOut();
                  window.location.reload();
                }}
              >
                <LogOut className="h-5 w-5 cursor-pointer" strokeWidth={1.5} />
              </Button>
            </div>
            <div className="px-1 py-1">
              <Button
                onClick={() => setOpen(false)}
                className="text-foreground/80 h-10 w-full justify-start gap-4 rounded-full"
                variant={"ghost"}
                asChild
              >
                <Link href="/settings/account">
                  <UserRoundCog className="h-4 w-4 opacity-70" strokeWidth={1.5} />
                  Account Settings
                </Link>
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="text-foreground/80 h-10 w-full justify-start gap-4 rounded-full"
                variant={"ghost"}
                asChild
              >
                <Link href="/settings/api-keys">
                  <Key className="h-4 w-4 opacity-70" strokeWidth={1.5} />
                  API Keys
                </Link>
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="text-foreground/80 h-10 w-full justify-start gap-4 rounded-full"
                variant={"ghost"}
                asChild
              >
                <Link href="/settings/attachments">
                  <FilesIcon className="h-4 w-4 opacity-70" strokeWidth={1.5} />
                  Attachments
                </Link>
              </Button>
              {user?.role === "admin" && (
                <Button
                  onClick={() => setOpen(false)}
                  className="text-foreground/80 h-10 w-full justify-start gap-4 rounded-full"
                  variant={"ghost"}
                  asChild
                >
                  <Link href="/settings/admin">
                    <LockIcon className="h-4 w-4 opacity-70" strokeWidth={1.5} />
                    Admin
                  </Link>
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
