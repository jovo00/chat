"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <nav className="grid gap-4 text-sm text-muted-foreground mb-4">
      <Link href="/settings/account" className={cn(isActive("/settings/account") && "font-semibold text-primary")}>
        Account
      </Link>
      <Link href="/settings/api-keys" className={cn(isActive("/settings/api-keys") && "font-semibold text-primary")}>
        API Keys
      </Link>
      <Link href="/settings/files" className={cn(isActive("/settings/files") && "font-semibold text-primary")}>
        File Uploads
      </Link>
    </nav>
  );
}
