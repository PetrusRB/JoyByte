"use client";

import { AuthProvider } from "@/contexts/auth/AuthContext";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from 'next-themes'

import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/Toast";

type LayoutClientProps = {
  children: React.ReactNode;
}

const LayoutClient: React.FC<LayoutClientProps> = ({ children }) => {
  return (
    <AntdRegistry>
      <ThemeProvider attribute='class' defaultTheme="system">
        <AuthProvider>
          <ErrorBoundary>
            {/* Navbar sempre visível, dentro do AuthContext */}
            <Navbar />

            {/* Aqui irá renderizar o layout com home/login */}
            <div className="flex-1">
              {children}
            </div>
            {/* Notificações */}
            <Toaster/>
            {/* Navegação mobile fixa embaixo */}
            <MobileNav />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </AntdRegistry>
  );
}

export default LayoutClient;
