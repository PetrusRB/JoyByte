"use client";

import React from "react";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ThemeProvider } from "next-themes";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { MantineProvider } from "@mantine/core";

const queryClient = new QueryClient();

type ProvidersProps = { children: React.ReactNode };

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider>
          <AntdRegistry>
            <ThemeProvider attribute="class" defaultTheme="system">
              {children}
            </ThemeProvider>
          </AntdRegistry>
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
