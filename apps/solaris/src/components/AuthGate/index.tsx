"use client";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth/AuthContext";

const HomeClient = dynamic(() => import("@/components/Home"), { ssr: false });
const Login = dynamic(() => import("@/components/Login"), { ssr: false });

// Client Component to handle authentication
export default function ClientWrapper() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HomeClient /> : <Login />;
}
