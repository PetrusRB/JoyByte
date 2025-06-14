"use client";

import { AuthProvider } from "@/contexts/auth/AuthContext";
import { AntdRegistry } from '@ant-design/nextjs-registry';

import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import React from "react";

type LayoutClientProps = {
  children: React.ReactNode;
}

const LayoutClient: React.FC<LayoutClientProps> = ({ children }) => {
  return (
    <AntdRegistry>
      <AuthProvider>
        {/* Navbar sempre visível, dentro do AuthContext */}
        <Navbar />

        {/* Aqui irá renderizar o layout com home/login */}
        <div className="flex-1">
          {children}
        </div>

        {/* Navegação mobile fixa embaixo */}
        <MobileNav />
      </AuthProvider>
    </AntdRegistry>
  );
}

export default LayoutClient;