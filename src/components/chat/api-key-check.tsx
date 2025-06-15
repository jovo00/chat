"use client";

import { Preloaded, usePreloadedQuery } from "@/lib/convex/use-preload";
import { api } from "@gen/api";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Key } from "lucide-react";

export default function NeedsApiKey({
  children,
  preloadedTokens,
  preloadedUser,
}: {
  children: ReactNode;
  preloadedTokens: Preloaded<typeof api.tokens.get.many>;
  preloadedUser: Preloaded<typeof api.users.get.current>;
}) {
  const { data } = usePreloadedQuery(preloadedTokens);
  const { data: user } = usePreloadedQuery(preloadedUser);

  return (
    <>
      {!data ||
        (data?.length === 0 && (
          <div className="bg-background absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center">
            <div className="bg-card flex flex-col items-center justify-center gap-1 rounded-3xl p-6 text-center">
              <h3 className="font-special text-xl">Welcome {user?.name ?? ""}</h3>
              <div className="font-medium">You need to add an API Key to start chatting!</div>

              <Button asChild className="mt-5">
                <Link href="/settings/api-keys">
                  <Key className="mr-2 size-4" />
                  Add API Key
                </Link>
              </Button>
            </div>
          </div>
        ))}
      {children}
    </>
  );
}
