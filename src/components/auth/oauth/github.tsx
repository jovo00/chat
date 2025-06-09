import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogo } from "@/components/icons/logos/github";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignInWithGithub() {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  return (
    <Button
      className="flex-1"
      type="button"
      variant={"input"}
      onClick={async () => {
        setSubmitting(true);
        try {
          await signIn("github");
          router.push("/");
        } catch (err) {
          console.error(err);
          setSubmitting(false);
        }
      }}
      disabled={submitting}
    >
      {submitting ? (
        <LoaderCircle className="repeat-infinite mr-2 size-4 animate-spin" />
      ) : (
        <GitHubLogo className="mr-2 h-4 w-4" />
      )}{" "}
      Github
    </Button>
  );
}
