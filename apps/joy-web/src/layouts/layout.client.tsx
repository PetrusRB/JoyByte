"use client";
const Navbar = lazy(() => import("@/components/Navbar"));

import React, { lazy } from "react";
import { Toaster } from "@/components/ui/Toast";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/auth/AuthContext";

type LayoutClientProps = {
  children: React.ReactNode;
};

const LayoutClient: React.FC<LayoutClientProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Se não estiver autenticado, renderiza apenas os filhos (ex: página de login)
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  return (
    <>
      {/* Navbar com sticky no topo */}
      <Navbar />

      {/* Layout principal */}
      <div className="min-h-screen dark:bg-black bg-orange-50 dark:text-white text-orange-700">
        <main className="py-8">
          {/* container to center the content */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sidebar esquerda com sticky */}
              <div className="lg:col-span-3">
                <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto hidden lg:block scrollbar-hide">
                  <Sidebar />
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="lg:col-span-9">{children}</div>
            </div>
          </div>
        </main>
      </div>

      {/* Notificação */}
      <Toaster />
    </>
  );
};

export default LayoutClient;
