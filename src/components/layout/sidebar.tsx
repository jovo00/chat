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

export default function Sidebar({
  lastSidebarState,
  lastDeviceState,
}: {
  lastSidebarState: boolean;
  lastDeviceState: "mobile" | "desktop";
  preloadedUser: PreloadedUser;
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
        "absolute lg:relative w-[18rem] md:w-[20rem] max-w-screen bg-sidebar shrink-0 h-full transition-[border,width,max-width] duration-300 z-40 overflow-x-hidden",
        (isDesktop ? collapsed : !mobileMenuOpen) && "w-0 md:w-0 lg:w-14"
      )}
    >
      {isDesktop && (
        <div
          className={cn(
            "z-10 flex flex-col p-2 w-full h-full absolute top-0 left-0 pt-4 transition-[padding-top] duration-300 overflow-hidden"
          )}
        >
          <Link
            href="/"
            className={cn("flex justify-center w-10 mb-8 transition-[margin-bottom] duration-300", collapsed && "mb-6")}
          >
            {isDesktop && (
              <Logo
                className={cn(
                  "h-6 w-0 lg:w-6 transition-[filter,width] duration-300 lg:opacity-100 opacity-0 lg:pointer-events-auto"
                )}
              />
            )}
          </Link>

          <div className="w-full flex relative justify-end">
            <Button
              variant={"ghost"}
              className={cn(
                "group p-0 absolute w-[calc(100%-2.8rem)] mr-[2.8rem] transition-all duration-300 top-0 justify-start px-3 gap-3 hover:no-underline",
                collapsed && "mr-0 w-full top-12"
              )}
              asChild
            >
              <Link href={"/"} prefetch>
                <SquarePen className={cn("w-4 h-4 transition-opacity")} />
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 left-11 opacity-100 transition-opacity delay-100 duration-300 font-bold",
                    collapsed && "opacity-0 delay-0 duration-100 pointer-events-none"
                  )}
                >
                  New Chat
                </span>
              </Link>
            </Button>
            <Button
              variant={"ghost"}
              size={"icon"}
              className="group p-0 size-10"
              onClick={() => setCollapsed((v: boolean) => !v)}
            >
              <ChevronLeft className={cn("w-4 h-4 transition-opacity", collapsed && "rotate-180")} />
            </Button>
          </div>
        </div>
      )}
      {/* <ChatHistory user={user} collapsed={collapsed} isDesktop={isDesktop} mobileMenuOpen={mobileMenuOpen} /> */}
    </aside>
  );
}
