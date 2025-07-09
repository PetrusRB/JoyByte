"use client";

import { AuthProvider } from "@/contexts/auth/AuthContext";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ThemeProvider } from "next-themes";

import React from "react";
import { Toaster } from "@/components/ui/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type LayoutClientProps = {
  children: React.ReactNode;
};
// Create a client
const queryClient = new QueryClient();

const LayoutClient: React.FC<LayoutClientProps> = ({ children }) => {
  return (
    <AntdRegistry>
      <ThemeProvider attribute="class" defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {/* Aqui irá renderizar o layout com home/login */}
            <div className="flex-1">{children}</div>
            {/* Notificações */}
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AntdRegistry>
  );
};

export default LayoutClient;
