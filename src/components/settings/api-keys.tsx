"use client";

import Link from "next/link";
import { CircleCheck, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PreloadedUser } from "@/lib/auth/server";
import { api } from "@gen/api";
import { Doc } from "@gen/dataModel";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { Preloaded, usePreloadedQuery } from "@/lib/convex/use-preload";
import { useMutation } from "@/lib/convex/use-mutation";
import { getErrorMessage } from "@/lib/utils";
import { useAction } from "@/lib/convex/use-action";

function KeyInput({
  provider,
  label,
  url,
  tokens,
}: {
  provider: "openrouter" | "replicate";
  label: string;
  url: string;
  tokens: Doc<"tokens">[];
}) {
  const providers = tokens?.map((token) => token.provider);

  const [override, setOverride] = useState(false);
  const [keyValue, setKeyValue] = useState("");

  const setToken = useAction(api.tokens.actions.setToken, {
    onSuccess(result) {
      setKeyValue("");
      setOverride(false);
      toast.success(`${label} API Key set successfully`);
    },
    onError(e) {
      toast.error("API Key could not be set", { description: getErrorMessage(e) });
    },
  });

  const unsetToken = useMutation(api.tokens.update.unset, {
    onError(e) {
      toast.error("API Key could not be deleted", { description: getErrorMessage(e) });
    },
    onSuccess() {
      toast.success(`${label} API Key deleted`);
    },
  });

  const apiKey = tokens?.find((key) => key.provider === provider);

  useEffect(() => {
    if (override) {
      setKeyValue("");
    }
  }, [override]);

  async function onSubmit(e: FormEvent<HTMLFormElement> | FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    await setToken.run({ provider, token: keyValue });
  }

  async function deleteApiKey() {
    if (!apiKey) return;

    await unsetToken.mutate({ token: apiKey._id });
  }

  return (
    <Card>
      <CardHeader className="border-none">
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          Add your {label} API Key. You can get your API key{" "}
          <Link className="text-foreground/80 underline" href={url} target="_blank">
            here
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="py-0">
        <form onSubmit={onSubmit}>
          {providers?.includes(provider) && !override ? (
            <div className="flex items-center gap-2 pb-4">
              <CircleCheck className="h-5 w-5 shrink-0 text-green-500" /> API Key is set
              <Button
                className="ml-auto"
                type="button"
                variant={"secondary"}
                onClick={() => {
                  setOverride(true);
                }}
              >
                Set New Key
              </Button>
              {providers.includes(provider) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant={"destructive"}>
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the API key for{" "}
                        <strong>{label}</strong>.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={deleteApiKey}
                          disabled={unsetToken.isPending}
                        >
                          Delete
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <Input
              name="key"
              value={keyValue}
              onChange={(e) => setKeyValue(e.currentTarget.value)}
              type="password"
              placeholder={label + " API Key"}
            />
          )}
        </form>
      </CardContent>
      {(!providers?.includes(provider) || override) && (
        <CardFooter className="gap-2 border-none px-6 py-4">
          <Button type="submit" onClick={onSubmit} disabled={setToken.isPending || keyValue?.trim()?.length === 0}>
            {setToken.isPending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Save"}
          </Button>
          {providers?.includes(provider) && override && (
            <>
              <Button
                variant={"secondary"}
                type="button"
                onClick={() => {
                  setOverride(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default function ApiKeys({
  preloadedUser,
  preloadedTokens,
}: {
  preloadedUser: PreloadedUser;
  preloadedTokens: Preloaded<typeof api.tokens.get.many>;
}) {
  const { data: tokens } = usePreloadedQuery(preloadedTokens);

  return (
    <>
      <div className="grid gap-6">
        <KeyInput label="OpenRouter" provider="openrouter" tokens={tokens} url="https://openrouter.ai/settings/keys" />
        <KeyInput
          label="Replicate"
          provider="replicate"
          tokens={tokens}
          url="https://replicate.com/account/api-tokens"
        />
      </div>
    </>
  );
}
