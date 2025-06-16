"use client";

import { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import ErrorDisplay from "@/components/ErrorDisplay";
import { getErrorDetails } from "@/libs/errors";

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorDisplay
          error={{
            ...getErrorDetails("INTERNAL"),
            message: error?.message || "Erro inesperado.",
          }}
          onRetry={resetErrorBoundary}
        />
      )}
    >
      {children}
    </ReactErrorBoundary>
  );
}
