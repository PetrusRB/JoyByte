"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth/AuthContext";
const EnhancedAuth = dynamic(() => import("@/components/Login"), { ssr: false });
const HomeForm = dynamic(() => import("@/components/Home"), { ssr: false });

export default function AuthGate() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HomeForm /> : <EnhancedAuth />;
}