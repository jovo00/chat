"use client";

import { Button } from "../ui/button";
import { Ban, ExternalLink, FileIcon, Link, LoaderCircle, RefreshCcw, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { cn, getErrorMessage } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
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
import { useConvex } from "convex/react";
import { api } from "@gen/api";
import { Preloaded, usePreloadedPaginatedQuery } from "@/lib/convex/use-preload";
import { Doc } from "@gen/dataModel";
import { ConvexError } from "convex/values";
import { useMutation } from "@/lib/convex/use-mutation";

export default function FileUploads({ preloadedFiles }: { preloadedFiles: Preloaded<typeof api.files.get.many> }) {
  const convex = useConvex();
  const files = usePreloadedPaginatedQuery(preloadedFiles);

  const formatter = new Intl.DateTimeFormat("de", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const { ref } = useInView({
    threshold: 0,
    onChange(inView) {
      if (inView && files.status === "CanLoadMore") {
        files.loadMore(50);
      }
    },
  });

  const deleteFile = useMutation(api.files.delete.one, {
    onError(e) {
      toast.error("Could not delete the file", {
        description: getErrorMessage(e),
      });
    },
  });

  async function openFile(file: Doc<"files">) {
    try {
      const fullFile = await convex.query(api.files.get.url, { file: file._id });
      if (!fullFile?.url) {
        toast.error("Could not get the file url");
        return;
      }

      window.open(fullFile.url, "_blank");
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error("Could not get the file url", { description: err?.data });
      } else {
        toast.error("Could not get the file url", { description: "Please try again later" });
      }
    }
  }

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>Here you can manage the files you uploaded.</CardDescription>
          </CardHeader>
          <CardContent className="pb-9">
            <div className="flex w-full flex-col gap-2">
              {files.results?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center text-center text-sm opacity-30">
                  No files yet
                </div>
              )}

              {files.results?.map((file, i) => {
                return (
                  <div
                    key={file?._id}
                    className={cn(
                      "bg-accent/40 border-accent/40 flex items-center gap-2 rounded-full border px-2 py-1 pr-1",
                    )}
                  >
                    <div className="bg-popover flex size-8 items-center justify-center rounded-full">
                      <FileIcon className="size-4" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="text-sm font-semibold">{file?.name}</h3>
                      <div className="text-xs opacity-80">{formatter.format(new Date(file?._creationTime))}</div>
                    </div>
                    <div>
                      <a onClick={() => openFile(file)} target="_blank">
                        <Button variant={"ghost"} size={"icon"} className="text-foreground/50">
                          <ExternalLink className="size-4" />
                        </Button>
                      </a>
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
                                {file?.name}
                              </span>
                              ?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant={"ghost"}>Cancel</Button>
                            </DialogClose>
                            <Button
                              variant={"destructive"}
                              onClick={() => deleteFile.mutate({ file: file._id })}
                              disabled={deleteFile.isPending}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}

              {!files.isLoading && (
                <div ref={ref} className="pointer-events-none z-50 -mt-40 flex min-h-[10em] w-full"></div>
              )}
              {!files.isLoading && files?.status === "CanLoadMore" && (
                <Button variant={"secondary"} className="mt-1" onClick={() => files?.loadMore(50)}>
                  Load more
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
