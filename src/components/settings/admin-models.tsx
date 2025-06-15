"use client";

import { Button } from "../ui/button";
import { FileIcon, LoaderCircle, Pencil, Plus, TextCursor, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { cn, getErrorMessage } from "@/lib/utils";
import { useInView } from "react-intersection-observer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { api } from "@gen/api";
import { Preloaded, usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import { useEffect, useMemo, useState } from "react";
import { OpenRouterModel } from "../../../convex/models/openrouter";
import ProviderLogo from "../icons/logos/providers";
import { useOpenRouterModels } from "@/lib/hooks/use-openrouter-models";
import { toast } from "sonner";
import { useMutation } from "@/lib/convex/use-mutation";
import { Input } from "../ui/input";
import { Doc } from "@gen/dataModel";

export default function AdminModels({ preloadedModels }: { preloadedModels: Preloaded<typeof api.models.get.many> }) {
  const models = usePreloadedPaginatedQuery(preloadedModels);

  const apiIds = useMemo(() => {
    return new Set(models.results.map((model) => model.api_id));
  }, [models]);

  const createModel = useMutation(api.models.create.one, {
    onError(e) {
      toast.error("Model could not be added", { description: getErrorMessage(e) });
    },
  });

  const deleteModel = useMutation(api.models.delete.one, {
    onError(e) {
      toast.error("Model could not be deleted", { description: getErrorMessage(e) });
    },
  });

  const openrouterModels = useOpenRouterModels({
    onError(message) {
      toast.error(message);
    },
  });

  async function addModel(model: OpenRouterModel) {
    await createModel.mutate({
      api: "openrouter",
      api_id: model.id,
      title: model.name,
      text_capabilities: {
        max_input_tokens: model.context_length ?? 0,
        features: {
          text_input: model.architecture.input_modalities.includes("text"),
          image_input: model.architecture.input_modalities.includes("image"),
          file_input: model.architecture.input_modalities.includes("file"),
          tools_input:
            (model.supported_parameters?.includes("tools") && model.supported_parameters?.includes("tool_choice")) ??
            false,
          reasoning_output: model.supported_parameters?.includes("reasoning") ?? false,
        },
        pricing: {
          completion: parseFloat(model.pricing.completion),
          image: parseFloat(model.pricing.image),
          prompt: parseFloat(model.pricing.prompt),
          request: parseFloat(model.pricing.request),
          web_search: parseFloat(model.pricing.web_search),
        },
        tokenizer: model.architecture.tokenizer,
      },
    });
  }

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Models</CardTitle>
            <CardDescription>Select the models that the users can use.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pb-9">
            <h3 className="text-base font-bold">Selected Models</h3>
            <div className="bg-background relative flex h-[30rem] max-h-[30rem] w-full flex-col gap-2 overflow-y-auto rounded-xl p-2">
              {models.results?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center text-center text-sm opacity-30">
                  No models yet
                </div>
              )}

              {models.results?.map((model, i) => {
                return (
                  <div
                    key={model?._id}
                    className={cn(
                      "bg-popover border-accent/40 relative flex items-center gap-2 rounded-full border p-1",
                    )}
                  >
                    <div className="bg-popover flex size-8 items-center justify-center rounded-full">
                      <ProviderLogo apiId={model?.api_id} api={model?.api} className="size-full" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="text-sm font-semibold">{model?.title}</h3>
                      {/* <div className="text-xs opacity-80">{model?.id}</div> */}
                    </div>

                    <div>
                      <RenameDialog model={model} />

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant={"ghost"} size={"icon"} className="text-foreground/50">
                            <Trash2 className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-100">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              deleteModel.mutate({ model: model._id });
                            }}
                            className="flex flex-col gap-4"
                          >
                            <DialogHeader>
                              <DialogTitle>Delete Model</DialogTitle>
                              <DialogDescription className="leading-relaxed">
                                Are you sure you want to delete{" "}
                                <span className="rounded-full bg-white/10 px-2 py-[0.15rem] text-xs font-semibold break-all text-white/80">
                                  {model?.title}
                                </span>
                                ?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant={"ghost"} type="button">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button variant={"destructive"} disabled={deleteModel.isPending} type="submit">
                                Delete
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}

              {models?.status === "CanLoadMore" && (
                <Button
                  variant={"secondary"}
                  className="mt-1"
                  onClick={() => models?.loadMore(50)}
                  disabled={models.isLoading}
                >
                  Load more
                </Button>
              )}
            </div>

            <h3 className="mt-4 text-base font-bold">Available Models (OpenRouter)</h3>
            <div className="bg-background flex h-[30rem] max-h-[30rem] w-full flex-col gap-2 overflow-y-auto rounded-xl p-2">
              {openrouterModels.isPending && (
                <div className="flex h-full w-full items-center justify-center gap-2 py-2 opacity-50">
                  <LoaderCircle className="repeat-infinite size-5 animate-spin" /> Loading models from OpenRouter
                </div>
              )}

              {!openrouterModels.isPending && openrouterModels?.data?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center text-center text-sm opacity-30">
                  No OpenRouter models found
                </div>
              )}

              {!openrouterModels.isPending &&
                openrouterModels?.data.map((model, i) => {
                  return (
                    <div
                      key={model?.id}
                      className={cn(
                        "bg-popover border-accent/40 flex items-center gap-2 rounded-full border p-1",
                        apiIds.has(model?.id) && "pointer-events-none opacity-50",
                      )}
                    >
                      <div className="bg-popover flex size-8 items-center justify-center rounded-full">
                        <ProviderLogo apiId={model?.id} api={"openrouter"} className="size-full" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="text-sm font-semibold">{model?.name}</h3>
                        {/* <div className="text-xs opacity-80">{model?.id}</div> */}
                      </div>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => addModel(model)}
                        disabled={createModel.isPending}
                      >
                        <Plus />
                      </Button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RenameDialog({ model }: { model: Doc<"models"> }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(model.title);
  const renameModel = useMutation(api.models.update.rename, {
    onError(e) {
      toast.error("Model could not be renamed", { description: getErrorMessage(e) });
    },
  });

  return (
    <Dialog
      onOpenChange={(open) => {
        setOpen(open);
        if (open) setValue(model.title);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="text-foreground/50">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-100">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (value?.trim().length === 0) {
              toast.error("Model could not be renamed", { description: "The title cannot be empty" });
              return;
            }
            if (value?.trim().length > 255) {
              toast.error("Model could not be renamed", { description: "The title can have 255 characters max" });
              return;
            }

            await renameModel.mutate({ modelId: model._id, newTitle: value });
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Rename Model</DialogTitle>
            <DialogDescription className="leading-relaxed">Give the model a new name</DialogDescription>
          </DialogHeader>
          <Input placeholder="Model Name" value={value} onInput={(e) => setValue(e.currentTarget.value)} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"ghost"} type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={renameModel.isPending}
              // onClick={() => renameModel.mutate({ modelId: model._id, newTitle: "" })}
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
