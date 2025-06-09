"use client";

import useMenuState from "@/lib/state/menu";
import { cn } from "@/lib/utils";

export default function ShiftMobile({ children }: { children: React.ReactNode }) {
  const mobileMenuOpen = useMenuState((state) => state.open);
  const setMobileMenuOpen = useMenuState((state) => state.setOpen);

  return (
    <div
      className={cn(
        "w-full h-full transition-[transform,opacity] duration-300",
        mobileMenuOpen && "translate-x-72 md:translate-x-80 lg:translate-x-0 opacity-60"
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
