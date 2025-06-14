"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SquarePen } from "lucide-react";
import Link from "next/link";
import { FallbackProps } from "react-error-boundary";

export function messagesErrorRender({ error, resetErrorBoundary }: FallbackProps) {
  const notFound = error?.message?.includes("Not found");
  const message = notFound ? "This chat does not exist" : "Could not get the messages for this chat.";

  return (
    <div role="alert" className="flex h-full w-full flex-col items-center justify-center p-4">
      <h1 className="font-special text-lg">{notFound ? "Not found" : "Error"}</h1>
      <p className="text-foreground/80 max-w-64 text-center">{message}</p>
      <Button className="mt-5" asChild>
        <Link href={"/"}>
          <SquarePen className={cn("h-4 w-4 transition-opacity")} /> Start a new chat
        </Link>
      </Button>
    </div>
  );
}
