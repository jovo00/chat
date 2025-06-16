"use client";

import { FallbackProps } from "react-error-boundary";

export function globalErrorFallback({ error }: FallbackProps) {
  return (
    <div
      className="animate-in fade-in-0 flex h-full w-full items-center justify-center opacity-80 duration-700"
      role="alert"
    >
      <p>Something went wrong</p>
    </div>
  );
}
