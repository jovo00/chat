"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, SquarePen } from "lucide-react";
import Link from "next/link";
import { useCookieState, useMediaQuery } from "@/lib/hooks";
import useMenuState from "@/lib/state/menu";
import Logo from "@/components/icons/logos/logo";
import { usePathname } from "next/navigation";
import { PreloadedUser } from "@/lib/auth/server";
import { isServer } from "@/lib/state/server";
import ChatHistory from "../chat/history/history";
import { Preloaded } from "convex/react";
import { api } from "@gen/api";

export default function Sidebar({
  lastSidebarState,
  lastDeviceState,
  preloadedChatHistory,
}: {
  lastSidebarState: boolean;
  lastDeviceState: "mobile" | "desktop";
  preloadedUser: PreloadedUser;
  preloadedChatHistory: Preloaded<typeof api.chat.get.chats>;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useCookieState("sidebarState", lastSidebarState);
  const [deviceState, setDeviceState] = useCookieState("deviceState", lastDeviceState);
  const isDesktop = deviceState === "desktop";

  const mobileMenuOpen = useMenuState((state) => state.open);
  const setMobileMenuOpen = useMenuState((state) => state.setOpen);

  useMediaQuery("(min-width: 1024px)", (matches) => {
    if (matches) {
      setDeviceState("desktop");
    } else {
      setDeviceState("mobile");
    }
  });

  useEffect(() => {
    !isServer && setMobileMenuOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/settings")) return null;

  return (
    <aside
      className={cn(
        "bg-sidebar absolute z-40 h-full w-[18rem] max-w-screen shrink-0 overflow-x-hidden transition-[border,width,max-width] duration-300 md:w-[20rem] lg:relative",
        (isDesktop ? collapsed : !mobileMenuOpen) && "w-0 md:w-0 lg:w-14",
      )}
    >
      {isDesktop && (
        <div
          className={cn(
            "absolute top-0 left-0 z-10 flex h-full w-full flex-col overflow-hidden p-2 pt-4 transition-[padding-top] duration-300",
          )}
        >
          <Link
            href="/"
            className={cn("mb-8 flex w-10 justify-center transition-[margin-bottom] duration-300", collapsed && "mb-6")}
          >
            {isDesktop && (
              <Logo
                className={cn(
                  "h-6 w-0 opacity-0 transition-[filter,width] duration-300 lg:pointer-events-auto lg:w-6 lg:opacity-100",
                )}
              />
            )}
          </Link>

          <div className="relative flex w-full justify-end">
            <Button
              variant={"ghost"}
              className={cn(
                "group absolute top-0 mr-[2.8rem] w-[calc(100%-2.8rem)] justify-start gap-3 p-0 px-4! transition-all duration-300 hover:no-underline",
                collapsed && "top-12 mr-0 w-full px-3!",
              )}
              asChild
            >
              <Link href={"/"} prefetch>
                <SquarePen className={cn("h-4 w-4 transition-opacity")} />
                <span
                  className={cn(
                    "absolute top-1/2 left-11 -translate-y-1/2 font-bold opacity-100 transition-opacity delay-100 duration-300",
                    collapsed && "pointer-events-none opacity-0 delay-0 duration-100",
                  )}
                >
                  New Chat
                </span>
              </Link>
            </Button>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="group size-10 p-0"
              onClick={() => setCollapsed((v: boolean) => !v)}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-opacity", collapsed && "rotate-180")} />
            </Button>
          </div>
        </div>
      )}
      <ChatHistory
        collapsed={collapsed}
        isDesktop={isDesktop}
        mobileMenuOpen={mobileMenuOpen}
        preloadedChatHistory={preloadedChatHistory}
      />
    </aside>
  );
}
