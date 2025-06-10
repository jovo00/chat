"use client";

import { useAuthToken } from "@convex-dev/auth/react";
import { api } from "@gen/api";
import { Doc, Id } from "@gen/dataModel";
import { useAction, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { FormEvent, useRef, useState } from "react";

export default function UploadTest() {
  const [progress, setProgress] = useState("");

  const authToken = useAuthToken();
  const fileInput = useRef<HTMLInputElement>(null);

  async function fileUploadHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!authToken) return;
    if (!fileInput.current?.files) return;
    if (!fileInput.current.files[0]) return;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${process.env.NEXT_PUBLIC_FILE_SERVER}/api/files`, true);

    xhr.upload.addEventListener("progress", (e) => {
      setProgress(`${Math.round((e.loaded / e.total) * 100)}%`);
    });

    // get the response of the request
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
      }
    };

    xhr.setRequestHeader("authorization", authToken);

    const formdata = new FormData();
    formdata.append("file", fileInput.current.files[0]);

    xhr.send(formdata);
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
              if (!authToken) return;
              await open(file, authToken);
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

async function presign(file: Id<"files">, authToken: string | null) {
  const url = `${process.env.NEXT_PUBLIC_FILE_SERVER}/api/files/presign`;
  const body = {
    file,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: authToken ?? "",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw Error(await res.text());
  }

  const data = await res.json();

  return data;
}

async function open(file: Doc<"files">, authToken: string) {
  const presigned = await presign(file._id, authToken);
  window.open(`${process.env.NEXT_PUBLIC_FILE_SERVER}/files/${file._id}/stream?token=${presigned?.token}`, "_blank");
}
