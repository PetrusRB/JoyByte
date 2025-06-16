'use client';

import { useEffect } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import { getErrorDetails } from "@/libs/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global capturado:", error);
  }, [error]);

  return <ErrorDisplay error={getErrorDetails("INTERNAL")} onRetry={reset} />;
}
