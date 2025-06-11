"use client";

import { Button } from "../ui/button";
import { FileIcon, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
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
import { Preloaded, useAction, useConvex, useMutation } from "convex/react";
import { api } from "@gen/api";
import { usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import { useEffect, useMemo, useState } from "react";
import { OpenRouterModel } from "../../../convex/models/openrouter";
import ProviderLogo from "../icons/logos/providers";
import { useOpenRouterModels } from "@/lib/hooks/use-openrouter-models";
import { toast } from "sonner";

export default function AdminModels({ preloadedModels }: { preloadedModels: Preloaded<typeof api.models.get.many> }) {
  const models = usePreloadedPaginatedQuery(preloadedModels);

  const apiIds = useMemo(() => {
    return new Set(models.results.map((model) => model.api_id));
  }, [models]);

  const createModel = useMutation(api.models.create.one);

  const deleteModel = useMutation(api.models.delete.one);

  const openrouterModels = useOpenRouterModels({
    onError(message) {
      toast.error(message);
    },
  });

  async function addModel(model: OpenRouterModel) {
    await createModel({
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
                      <ProviderLogo title={model?.title} className="size-full" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="text-sm font-semibold">{model?.title}</h3>
                      {/* <div className="text-xs opacity-80">{model?.id}</div> */}
                    </div>

                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant={"ghost"} size={"icon"} className="text-foreground/50">
                            <Trash2 className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-100">
                          <DialogHeader>
                            <DialogTitle>Delete File</DialogTitle>
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
                              <Button variant={"ghost"}>Cancel</Button>
                            </DialogClose>
                            <Button variant={"destructive"} onClick={() => deleteModel({ model: model._id })}>
                              Delete
                            </Button>
                          </DialogFooter>
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

            <h3 className="mt-4 text-base font-bold">Available Models</h3>
            <div className="bg-background flex h-[30rem] max-h-[30rem] w-full flex-col gap-2 overflow-y-auto rounded-xl p-2">
              {openrouterModels.isLoading && (
                <div className="flex h-full w-full items-center justify-center gap-2 py-2 opacity-50">
                  <LoaderCircle className="repeat-infinite size-5 animate-spin" /> Loading models from OpenRouter
                </div>
              )}

              {!openrouterModels.isLoading && openrouterModels?.data?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center text-center text-sm opacity-30">
                  No OpenRouter models found
                </div>
              )}

              {!openrouterModels.isLoading &&
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
                        <ProviderLogo title={model?.name} className="size-full" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="text-sm font-semibold">{model?.name}</h3>
                        {/* <div className="text-xs opacity-80">{model?.id}</div> */}
                      </div>
                      <Button variant={"ghost"} size={"icon"} onClick={() => addModel(model)}>
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
