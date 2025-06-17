"use client";

import { cn, getPricingColor, getProviderName, roundCost } from "@/lib/utils";
import { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { BrainIcon, ChevronDown, EyeIcon, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DialogTitle } from "@radix-ui/react-dialog";
import { api } from "@gen/api";
import { Preloaded, usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import { Doc, Id } from "@gen/dataModel";
import useInputState from "@/lib/state/input";
import ProviderLogo from "@/components/icons/logos/providers";
import { useCookieState } from "@/lib/hooks/use-cookie-state";
import { useQuery } from "@/lib/convex/use-query";

export default function ModelSelect({
  preloadedModels,
  lastModelState,
  small = false,
}: {
  preloadedModels: Preloaded<typeof api.models.get.many>;
  small?: boolean;
  lastModelState?: Doc<"models">;
}) {
  const model = useInputState((state) => state.model);
  const setModel = useInputState((state) => state.setModel);
  const [savedModel, setSavedModel] = useCookieState("modelId", lastModelState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!model && savedModel) {
      setModel(savedModel);
    } else {
      setSavedModel(model);
    }
  }, [savedModel, model]);

  const currentModel = model ?? savedModel;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger className="w-full" asChild>
          {currentModel ? (
            <ModelButton small={small} setOpen={setOpen} model={currentModel} lastModelState={lastModelState} />
          ) : (
            <NoModelSelected setOpen={setOpen} small={small} />
          )}
        </DrawerTrigger>
        <DrawerContent className="bg-card">
          <DrawerTitle className="sr-only">Model Select</DrawerTitle>
          <div className="mt-4 border-t">
            <ModelList small={small} setOpen={setOpen} preloadedModels={preloadedModels} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full" asChild>
        {currentModel ? (
          <ModelButton small={small} model={currentModel} setOpen={setOpen} lastModelState={lastModelState} />
        ) : (
          <NoModelSelected setOpen={setOpen} small={small} />
        )}
      </DialogTrigger>
      <DialogContent className="h-120 max-h-[calc(80dvh-3rem)] w-240 max-w-[calc(100dvw-2rem)] overflow-hidden rounded-3xl p-0 sm:max-w-[calc(100dvw-2rem)]">
        <DialogTitle className="hidden">Model Select</DialogTitle>
        <ModelList small={small} setOpen={setOpen} preloadedModels={preloadedModels} />
      </DialogContent>
    </Dialog>
  );
}

function NoModelSelected({ small, setOpen }: { small: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  return (
    <Button
      variant="secondary"
      type="button"
      className={cn(
        "bg-input flex h-16 w-full cursor-pointer items-center justify-between rounded-full border-none text-sm font-semibold ring-offset-transparent select-none focus:ring-0 focus:ring-transparent has-[>svg]:px-7 lg:text-base",
        small && "-ml-2 h-fit w-fit justify-start gap-1 p-2 has-[>svg]:px-2",
        small && "text-sm",
      )}
      onClick={() => setOpen(true)}
    >
      Choose a model <ChevronDown className="size-5" />
    </Button>
  );
}

function ModelButton({
  small,
  setOpen,
  model,
  lastModelState,
}: {
  small?: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  model: Id<"models">;
  lastModelState?: Doc<"models">;
}) {
  const { data: selectedModel } = useQuery(api.models.get.one, { model });

  const [currentSelectedModel, setCurrentSelectedModel] = useState(lastModelState);

  useEffect(() => {
    if (selectedModel) {
      setCurrentSelectedModel(selectedModel);
    }
  }, [selectedModel]);

  const maxTokens = currentSelectedModel?.text_capabilities?.max_input_tokens ?? 0;

  return (
    <Button
      variant="secondary"
      className={cn(
        "bg-input h-16 w-full cursor-pointer justify-start rounded-full border-none px-4 ring-offset-transparent select-none focus:ring-0 focus:ring-transparent",
        small && "bg-accent dark:bg-input dark:hover:bg-accent -ml-2 h-fit w-fit max-w-[50%] p-2",
      )}
      onClick={() => setOpen(true)}
      asChild
      type="button"
    >
      <div>
        {currentSelectedModel ? (
          <div className={cn("relative flex w-full items-center gap-3", small && "gap-2")}>
            <div className={cn("size-7 shrink-0 md:size-9", small && "size-6 md:size-6")}>
              <ProviderLogo apiId={currentSelectedModel.api_id} api={currentSelectedModel.api} className="size-full" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
              <h5
                className={cn(
                  "max-w-full overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap md:text-base",
                  small && "text-xs md:text-sm",
                )}
              >
                {currentSelectedModel.title}
              </h5>

              {!small && (
                <div className="flex h-5 items-center gap-2">
                  <p
                    className={cn(
                      "text-foreground/50 flex items-center gap-1 text-xs md:text-sm",
                      small && "text-xs md:text-xs",
                    )}
                  >
                    <span className="text-xs font-normal">
                      {maxTokens >= 1000000
                        ? Math.round(maxTokens / 100000) / 10 + "M"
                        : Math.round(maxTokens / 1000) + "k"}{" "}
                      Context
                    </span>
                  </p>

                  <div className="flex items-center gap-1">
                    {currentSelectedModel?.text_capabilities?.features?.image_input && (
                      <span>
                        <EyeIcon className="size-[0.8rem] rounded-full text-emerald-300" />
                      </span>
                    )}
                    {currentSelectedModel?.text_capabilities?.features?.file_input && (
                      <span>
                        <FileText className="size-[0.8rem] rounded-full text-sky-300" />
                      </span>
                    )}
                    {currentSelectedModel?.text_capabilities?.features?.reasoning_output && (
                      <span>
                        <BrainIcon className="size-[0.8rem] rounded-full text-purple-300" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          "Select model"
        )}
      </div>
    </Button>
  );
}

function ModelList({
  small,
  preloadedModels,
  setOpen,
}: {
  small?: boolean;
  preloadedModels: Preloaded<typeof api.models.get.many>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const models = usePreloadedPaginatedQuery(preloadedModels);

  const [searching, setSearching] = useState(false);
  const setModel = useInputState((state) => state.setModel);
  const selectedModel = useInputState((state) => state.model);

  const modelMap: Map<string, Doc<"models">> = useMemo(() => {
    if (!models) return new Map();
    return new Map(models.results.map((m) => [m._id, m]));
  }, [models]);

  return (
    <Command
      filter={(value, search) => {
        const model = modelMap?.get(value);
        if (!model) return 0;

        let ranking = 0;

        let searchLower = search.toLowerCase();

        if (model.title.toLowerCase().includes(searchLower)) ranking++;
        if (model.title.replaceAll(" ", "").toLowerCase().includes(searchLower.replaceAll(" ", ""))) ranking++;
        if (model.api_id.toLowerCase().includes(searchLower)) ranking++;

        return ranking / 4;
      }}
    >
      <CommandInput
        placeholder="Search model..."
        onInput={(e) => {
          if (e.currentTarget.value.trim().length > 0) {
            !searching && setSearching(true);
          } else {
            searching && setSearching(false);
          }
        }}
        className="h-12"
      />
      <CommandList className="max-h-[calc(80dvh-3rem)]">
        <CommandEmpty>Model not found</CommandEmpty>
        <CommandGroup>
          {models?.results?.map((model, i) => {
            let estimatedCost = roundCost(
              ((model?.text_capabilities?.pricing?.prompt ?? 0) +
                (model?.text_capabilities?.pricing?.completion ?? 0) * 3) /
                4,
            );
            return (
              <Fragment key={model._id}>
                <CommandItem
                  value={model._id}
                  onSelect={(value) => {
                    setModel(model._id);
                    setOpen(false);
                  }}
                  className="mt-1 rounded-full"
                  asChild
                >
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      selectedModel === model._id && "border-accent-foreground/30 bg-accent-foreground/5 border",
                    )}
                  >
                    <ProviderLogo
                      apiId={model.api_id}
                      api={model.api}
                      className={cn(
                        "size-7 min-h-7 min-w-7 shrink-0 md:size-9 md:min-h-9 md:min-w-9",
                        small && "size-7 min-h-7 min-w-7 md:size-7 md:min-h-7 md:min-w-7",
                      )}
                    />
                    <div className="flex flex-1 flex-col items-start justify-center">
                      <h5 className={cn("text-sm font-semibold md:text-base", small && "text-sm md:text-sm")}>
                        {model.title}
                      </h5>
                      <div className="flex items-center gap-1">
                        <p className="opacity-80">{getProviderName(model.api)}</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <p
                              className={cn(
                                "flex size-[1.2rem] items-center justify-center rounded-full bg-black/50 text-[0.65rem] font-semibold",
                              )}
                              style={{
                                background: getPricingColor(estimatedCost) + 22,
                                color: getPricingColor(estimatedCost),
                              }}
                            >
                              $
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-col">
                              <h4 className="font-semibold">Pricing</h4>
                              <div className="opacity-80">
                                Input:{" "}
                                <span className="font-mono">
                                  {roundCost(model.text_capabilities?.pricing.prompt ?? 0)}$/M
                                </span>
                              </div>
                              <div className="opacity-80">
                                Output:{" "}
                                <span className="font-mono">
                                  {roundCost(model.text_capabilities?.pricing.completion ?? 0)}$/M
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>

                        <p className={cn("text-xs opacity-50 md:text-sm", small && "text-xs md:text-xs")}>
                          {(model.text_capabilities?.max_input_tokens ?? 0) >= 1000000
                            ? Math.round((model.text_capabilities?.max_input_tokens ?? 0) / 100000) / 10 + "M"
                            : Math.round((model.text_capabilities?.max_input_tokens ?? 0) / 1000) + "k"}{" "}
                          Context
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {model?.text_capabilities?.features?.image_input && (
                        <Tooltip>
                          <TooltipTrigger>
                            <EyeIcon className="size-8 min-h-8 min-w-8 rounded-full bg-emerald-900/80 p-2 text-emerald-200" />
                          </TooltipTrigger>
                          <TooltipContent>Supports image upload and analysis</TooltipContent>
                        </Tooltip>
                      )}
                      {model?.text_capabilities?.features?.file_input && (
                        <Tooltip>
                          <TooltipTrigger>
                            <FileText className="size-8 min-h-8 min-w-8 rounded-full bg-sky-900/80 p-2 text-sky-200" />
                          </TooltipTrigger>
                          <TooltipContent>Supports document upload and analysis</TooltipContent>
                        </Tooltip>
                      )}
                      {/* {model?.text_capabilities?.features?.tools_input && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Wrench className="size-8 min-h-8 min-w-8 rounded-full bg-slate-600/40 p-2 text-slate-300" />
                          </TooltipTrigger>
                          <TooltipContent>Supports Tools</TooltipContent>
                        </Tooltip>
                      )} */}
                      {model?.text_capabilities?.features?.reasoning_output && (
                        <Tooltip>
                          <TooltipTrigger>
                            <BrainIcon className="size-8 min-h-8 min-w-8 rounded-full bg-purple-900/80 p-2 text-purple-200" />
                          </TooltipTrigger>
                          <TooltipContent>Has reasoning capabilities</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </CommandItem>
              </Fragment>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
