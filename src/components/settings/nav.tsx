"use client";

import { PreloadedUser } from "@/lib/auth/server";
import { usePreloadedQuery } from "@/lib/convex/use-preload";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsNav({ preloadedUser }: { preloadedUser: PreloadedUser }) {
  const { data: user } = usePreloadedQuery(preloadedUser);
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <nav className="text-muted-foreground mb-4 grid gap-4 text-sm">
      <Link href="/settings/account" className={cn(isActive("/settings/account") && "text-primary font-semibold")}>
        Account
      </Link>
      <Link href="/settings/api-keys" className={cn(isActive("/settings/api-keys") && "text-primary font-semibold")}>
        API Keys
      </Link>
      <Link
        href="/settings/attachments"
        className={cn(isActive("/settings/attachments") && "text-primary font-semibold")}
      >
        Attachments
      </Link>
      {user?.role === "admin" && (
        <Link href="/settings/admin" className={cn(isActive("/settings/admin") && "text-primary font-semibold")}>
          Admin
        </Link>
      )}
    </nav>
  );
}
