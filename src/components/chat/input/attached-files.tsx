import React from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, LoaderCircle, X } from "lucide-react";
import { Doc } from "@gen/dataModel";
import getIcon from "@/lib/file-icons/get-icon";

interface AttachedFilesProps {
  files: Doc<"files">[];
  onRemove: (fileId: string) => void;
}

const AttachedFiles: React.FC<AttachedFilesProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex max-h-60 w-full flex-wrap gap-2 overflow-y-auto">
      {files.map((file) => (
        <div key={file._id} className="bg-accent flex max-w-56 items-center gap-2 rounded-full py-1 pr-1 pl-3">
          {file.storage.startsWith("%") ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin" />
          ) : (
            <img src={getIcon(file?.name, false)} className="size-4 shrink-0" />
          )}
          <p className="w-full overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">{file.name}</p>
          <Button
            variant="ghost"
            size="icon"
            className="aspect-square size-6 shrink-0"
            onClick={() => onRemove(file._id)}
            // disabled={file.loading}
          >
            <X className="size-4" />
            <span className="sr-only">Remove {file.name}</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(AttachedFiles);
