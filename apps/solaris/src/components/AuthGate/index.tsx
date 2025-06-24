"use client";

import { useAuth } from "@/contexts/auth/AuthContext";
import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("@/components/Home"), { ssr: false });
const Login = dynamic(() => import("@/components/Login"), { ssr: false });

export default function ClientWrapper() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HomeClient /> : <Login />;
}
