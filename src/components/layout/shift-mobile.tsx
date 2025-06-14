"use client";

import useMenuState from "@/lib/state/menu";
import { cn } from "@/lib/utils";

export default function ShiftMobile({ children }: { children: React.ReactNode }) {
  const mobileMenuOpen = useMenuState((state) => state.open);
  const setMobileMenuOpen = useMenuState((state) => state.setOpen);

  return (
    <div
      className={cn(
        "h-full w-full transition-all duration-300",
        mobileMenuOpen && "translate-x-72 opacity-60 md:translate-x-80 lg:translate-x-0",
      )}
      onClick={(e) => {
        e.stopPropagation();
        setMobileMenuOpen(false);
      }}
    >
      {children}
    </div>
  );
}
