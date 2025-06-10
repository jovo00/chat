"use client";

import { useAuthToken } from "@convex-dev/auth/react";
import { api } from "@gen/api";
import { Doc, Id } from "@gen/dataModel";
import { useAction, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { FormEvent, useRef, useState } from "react";

export default function UploadTest() {
  const [progress, setProgress] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const authToken = useAuthToken();

  async function fileUploadHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fileInput.current?.files) return;
    if (!fileInput.current.files[0]) return;

    const file = fileInput.current.files[0];

    const sendImageUrl = new URL(`${process.env.NEXT_PUBLIC_CONVEX_ACTIONS_URL}/upload-file`);
    sendImageUrl.searchParams.set("name", file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", sendImageUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);

    xhr.upload.addEventListener("progress", (e) => {
      setProgress(`${Math.round((e.loaded / e.total) * 100)}%`);
    });

    // get the response of the request
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
      }
    };

    xhr.send(file);

    fileInput.current.value = "";
  }

  const files = usePaginatedQuery(api.files.get_file.many, {}, { initialNumItems: 50 });
  const deleteMutation = useMutation(api.files.delete_files.one);

  return (
    <>
      <form onSubmit={fileUploadHandler} className="flex items-center">
        <input ref={fileInput} type="file" name="file" id="file" />
        <button type="submit" className="w-fit cursor-pointer bg-white/5 px-4 py-2 hover:bg-white/10">
          Upload
        </button>
        <div id="progress">{progress}</div>
      </form>

      <div className="flex flex-col gap-2">
        {files?.results?.map((file) => (
          <a
            href={"/folder/" + file._id}
            key={file._id}
            className="rounded-md bg-white/5 px-4 py-2"
            onClick={async (e) => {
              e.preventDefault();
            }}
            onDoubleClick={async () => {
              // await open(file, authToken);
            }}
          >
            {file.name}
          </a>
        ))}
        <div>Delete</div>
        {files?.results?.map((file) => (
          <a
            href={"/folder/" + file._id}
            key={file._id}
            className="rounded-md bg-white/5 px-4 py-2"
            onClick={async (e) => {
              e.preventDefault();
            }}
            onDoubleClick={async () => {
              await deleteMutation({ file: file._id });
            }}
          >
            {file.name}
          </a>
        ))}
      </div>
    </>
  );
}
