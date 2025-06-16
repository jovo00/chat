import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePaginatedQuery } from "@/lib/convex/use-paginated-query";
import getIcon from "@/lib/file-icons/get-icon";
import { cn } from "@/lib/utils";
import { api } from "@gen/api";
import { Doc } from "@gen/dataModel";
import { Dispatch, SetStateAction, useEffect, memo } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

function SelectFileComponent({
  selectFile,
  setSelectFile,
  files,
  setFiles,
  maxFileCount,
}: {
  selectFile: boolean;
  setSelectFile: Dispatch<SetStateAction<boolean>>;
  files: Doc<"files">[];
  setFiles: Dispatch<SetStateAction<Doc<"files">[]>>;
  maxFileCount: number;
}) {
  const fileList = usePaginatedQuery(api.files.get.many, {}, { initialNumItems: 25 });
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && fileList?.status === "CanLoadMore") {
      fileList?.loadMore(25);
    }
  }, [inView, fileList?.isLoading || fileList?.status]);

  const formatter = new Intl.DateTimeFormat("de", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <Dialog open={selectFile} onOpenChange={setSelectFile} modal>
      <DialogContent className="sm:max-w-180">
        <DialogHeader>
          <DialogTitle>Select Files</DialogTitle>
          <DialogDescription>Select up to {maxFileCount} files</DialogDescription>
        </DialogHeader>

        <div className="flex h-full max-h-[calc(100dvh-16rem)] w-full flex-col gap-2 overflow-y-auto p-2">
          {fileList?.results?.length === 0 && (
            <div className="flex h-full w-full items-center justify-center text-center text-sm opacity-30">
              No files uploaded yet
            </div>
          )}

          {fileList?.results?.map((file, i) => {
            const selected = files?.find((f) => f._id === file._id);
            return (
              <div
                key={file?._id}
                className={cn(
                  "bg-accent/50 border-accent/50 flex cursor-pointer items-center gap-3 rounded-full border px-2 py-1",
                  selected && "bg-accent border border-white/40",
                )}
                onClick={() => {
                  if (selected) {
                    setFiles((files) => files.filter((f) => f._id !== file._id));
                  } else {
                    if (files.length >= maxFileCount) {
                      toast.error("You can only select up to " + maxFileCount + " files you already uploaded");
                      return;
                    }

                    setFiles((files) => [...files, file]);
                  }
                }}
              >
                <div className="bg-popover flex size-8 items-center justify-center rounded-full">
                  <img src={getIcon(file?.name, false)} className="size-4" />
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="text-sm font-semibold">{file?.name}</h3>
                  <div className="text-xs opacity-80">{formatter.format(new Date(file?._creationTime))}</div>
                </div>
              </div>
            );
          })}

          {!fileList.isLoading && (
            <div ref={ref} className="pointer-events-none z-50 -mt-40 flex min-h-[10em] w-full"></div>
          )}
          <div className="h-2"></div>
          {!fileList.isLoading && fileList?.status === "CanLoadMore" && (
            <Button variant={"secondary"} className="mt-1" onClick={() => fileList?.loadMore(25)}>
              Load more
            </Button>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant={"ghost"} onClick={() => setFiles([])}>
            Deselect All
          </Button>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const SelectFile = memo(SelectFileComponent);
