"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        signOut();
        router.push("/auth");
      }}
    >
      Logout
    </Button>
  );
}
