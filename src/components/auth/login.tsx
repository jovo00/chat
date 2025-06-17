"use client";

import { useState } from "react";
import aiBackdrop from "@/assets/images/ai-logo.jpg";

import Image from "next/image";
import { cn } from "@/lib/utils";
import Logo from "@/components/icons/logos/logo";
import { SignInWithGoogle } from "./oauth/google";
import { SignInWithGithub } from "./oauth/github";

export default function Login() {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  return (
    <div className="absolute top-0 left-0 flex h-full w-full">
      <div className="bg-secondary/50 pointer-events-none relative hidden h-full w-full flex-1 select-none xl:block">
        <Image
          src={aiBackdrop}
          alt=""
          objectFit="cover"
          fill
          className={cn("transition-opacity", imageLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <main className="bg-background flex h-svh min-h-50 w-full flex-1 items-center justify-center pb-6 dark:bg-black">
        <div className="flex w-100 flex-col items-center justify-center gap-2 overflow-hidden rounded-md">
          <div className="p-4">
            <Logo className="fill-primary-foreground mx-auto h-9 w-9" />
          </div>
          <div className="mb-4">
            <h1 className="font-special my-1 text-center text-2xl font-bold">AI Chat</h1>
            <p className="text-foreground/50 text-center text-sm font-medium">Login to start chatting!</p>
          </div>

          <SignInWithGoogle />
          {/* <SignInWithGithub /> */}
        </div>
      </main>
    </div>
  );
}
