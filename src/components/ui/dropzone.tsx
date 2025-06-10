"use client";

import { useDropzone } from "react-dropzone";
import { useEffect, useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function Dropzone({ disabled, onDrop }: { disabled?: boolean; onDrop: (files: File[]) => void }) {
  const [showDropzone, setShowDropzone] = useState(false);
  const { acceptedFiles, getRootProps, getInputProps, rootRef } = useDropzone({
    noClick: true,
    onDragEnter: () => {
      setShowDropzone(!disabled);
    },
    onDragLeave: () => {
      setShowDropzone(false);
    },
    onDrop: () => {
      setShowDropzone(false);
    },
    onDropAccepted: onDrop,
    onDropRejected: () => {
      setShowDropzone(false);
    },
  });

  useEffect(() => {
    const dropzoneVisible = () => {
      setShowDropzone(!disabled);
    };

    const hideDropzone = () => {
      setShowDropzone(false);
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDropzone(false);
      }
    };

    document.addEventListener("dragenter", dropzoneVisible);
    document.addEventListener("keydown", keyHandler);
    rootRef.current?.addEventListener("drop", hideDropzone);

    return () => {
      document.removeEventListener("dragenter", dropzoneVisible);
      document.removeEventListener("keydown", keyHandler);
      rootRef.current?.removeEventListener("drop", hideDropzone);
    };
  }, []);

  return (
    <>
      <div
        {...getRootProps({
          className:
            "backdrop-blur-xs w-full h-full fixed bg-black/80 top-0 left-0 z-60 transition-opacity duration-300",
          style: {
            pointerEvents: showDropzone ? "all" : "none",
            opacity: showDropzone ? 1 : 0,
          },
        })}
        onClick={() => setShowDropzone(false)}
      >
        <input {...getInputProps()} />
        <div
          className="pointer-events-none flex h-full w-full items-center justify-center p-[3%] transition-transform duration-300"
          style={{
            transform: showDropzone ? "scale(1)" : "scale(0.95)",
          }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed p-4">
            <Upload
              className="h-9 w-9 transition-[transform,opacity] duration-300"
              strokeWidth={1.5}
              style={{
                transform: showDropzone ? "translateY(0)" : "translateY(1rem)",
                opacity: showDropzone ? 1 : 0,
              }}
            />
            <p className="max-w-56 text-center">Add attachment</p>
          </div>
        </div>
      </div>
    </>
  );
}
