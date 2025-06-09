"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";
import aiBackdrop from "@/assets/images/ai-logo.jpg";

import Image from "next/image";
import { cn } from "@/lib/utils";
import Logo from "@/components/icons/logos/logo";
import { SignInWithGoogle } from "./oauth/google";
import { SignInWithGithub } from "./oauth/github";

export default function Login() {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  return (
    <div className="flex absolute left-0 top-0 w-full h-full">
      <div className="relative flex-1 h-full w-full select-none pointer-events-none hidden xl:block bg-secondary/50">
        <Image
          src={aiBackdrop}
          alt=""
          objectFit="cover"
          fill
          className={cn("transition-opacity", imageLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <main className="flex h-screen w-full items-center justify-center bg-background dark:bg-black min-h-96 flex-1">
        <div className="flex w-100 flex-col gap-2 overflow-hidden rounded-md">
          <div className="p-4">
            <Logo className="mx-auto h-9 w-9 fill-primary-foreground " />
          </div>
          <div className="mb-4">
            <h1 className="font-special my-1 text-center text-2xl font-bold">Login</h1>
            <p className="text-center text-sm font-medium text-foreground/50">Login to start chatting!</p>
          </div>

          <SignInWithGoogle />
          <SignInWithGithub />
        </div>
      </main>
    </div>
  );
}
