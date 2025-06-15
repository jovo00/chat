import { useAuthToken } from "@convex-dev/auth/react";
import { Doc, Id } from "@gen/dataModel";
import { useState, useRef, useCallback, FormEvent } from "react";
import { toast } from "sonner";
import { useQuery } from "../convex/use-query";
import { api } from "@gen/api";

const MAX_FILE_COUNT = 10;

export function useFileAttachments() {
  const [attachedFiles, setAttachedFiles] = useState<Doc<"files">[]>([]);

  const authToken = useAuthToken();
  const user = useQuery(api.users.get.current);

  async function handleFileInputChange(e: FormEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.currentTarget?.files) return;

    Array.from(e.currentTarget?.files).map((file) => {
      return uploadFile(file);
    });

    e.currentTarget.value = "";
  }

  const uploadFile = (file: File) => {
    if (!user.data?._id) throw new Error("Not authorized");

    const randomId = Math.random().toString(36).substring(7);
    const optimisticFile: Doc<"files"> = {
      _id: randomId as Id<"files">,
      name: file.name,
      _creationTime: Date.now(),
      storage: "%0" as Id<"_storage">,
      user: user.data?._id,
    };

    setAttachedFiles((prev) => [...prev, optimisticFile]);

    const sendImageUrl = new URL(`${process.env.NEXT_PUBLIC_CONVEX_ACTIONS_URL}/upload-file`);
    sendImageUrl.searchParams.set("name", file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", sendImageUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);

    xhr.upload.addEventListener("progress", (e) => {
      setAttachedFiles((prev) =>
        prev.map((file) => {
          if (file._id === optimisticFile._id) {
            file.storage = `%${Math.round((e.loaded / e.total) * 100)}` as Id<"_storage">;
            return file;
          } else {
            return file;
          }
        }),
      );
    });

    // get the response of the request
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        setAttachedFiles((prev) => prev.map((f) => (f._id === randomId ? res : f)));
      } else if (xhr.status !== 200) {
        toast.error(`Failed to upload ${file.name}.`, { description: xhr.statusText });
        setAttachedFiles((prev) => prev.filter((f) => f._id !== randomId));
      }
    };

    xhr.send(file);
  };

  const handleFileDrop = useCallback(
    (files: File[], allowedFiletypes: string[]) => {
      const supportedFiles = files.filter((f) => allowedFiletypes.some((ft) => f.name.endsWith(ft)));

      if (supportedFiles.length !== files.length) {
        toast.error("Some files have unsupported types and were not added.");
      }
      if (supportedFiles.length === 0) return;

      if (attachedFiles.length + supportedFiles.length > MAX_FILE_COUNT) {
        toast.error(`You can only attach up to ${MAX_FILE_COUNT} files.`);
        return;
      }

      supportedFiles.forEach((file) => uploadFile(file));
    },
    [attachedFiles.length, user],
  );

  const removeFile = useCallback((fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f._id !== fileId));
  }, []);

  return {
    attachedFiles,
    setAttachedFiles,
    handleFileDrop,
    handleFileInputChange,
    removeFile,
    MAX_FILE_COUNT,
  };
}
