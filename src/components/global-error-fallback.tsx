"use client";

import { ErrorBoundaryHandler } from "next/dist/client/components/error-boundary";
import { ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryPropsWithRender, FallbackProps } from "react-error-boundary";

export function globalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
    </div>
  );
}
