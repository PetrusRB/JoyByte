"use client";

import React, { ReactNode, useState, useRef, useTransition } from "react";
import ky from "ky";
import { toast } from "sonner";

interface RequestButtonProps {
  url: string;
  method?: "GET" | "POST";
  children?: ReactNode;
  message?: string;
  body?: Record<string, any>;
  searchParams?: Record<string, string | number>;
  cooldownMs?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  label?: string;
  className?: string;
}

export const RequestButton: React.FC<RequestButtonProps> = ({
  url,
  method = "POST",
  body,
  searchParams,
  cooldownMs = 3000,
  onSuccess,
  message,
  onError,
  label = "Enviar",
  children,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [isPending, startTr] = useTransition();

  const handleClick = () => {
    if (loading || cooldown) return;
    setLoading(true);
    setCooldown(true);

    // Abortar requisição anterior
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    startTr(() => {
      ky.extend({ timeout: 10000, retry: 1 })
        .post(url, {
          method,
          json: body,
          searchParams,
          signal: controller.signal,
        })
        .json()
        .then((data) => onSuccess?.(data))
        .catch((err) => {
          if (controller.signal.aborted) return;
          onError?.(err);
        })
        .finally(() => {
          setLoading(false);
          toast(message);
          // Reseta cooldown após X ms
          setTimeout(() => setCooldown(false), cooldownMs);
        });
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || cooldown || isPending}
      className={`px-4 py-2 rounded-md border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors duration-200 bg-black/10 hover:bg-white/5 disabled:opacity-50 ${className}`}
    >
      {loading || isPending ? "Enviando..." : label}
      {children}
    </button>
  );
};
