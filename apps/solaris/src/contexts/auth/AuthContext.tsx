"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import type { Session } from "next-auth";

// Tipos de provedores suportados
export type AuthProvider = "google" | "github" | "instagram" | "facebook";

interface AuthContextType {
  isAuthenticated: boolean;
  user: Session["user"] | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const signIn = async (provider: AuthProvider) => {
    await nextAuthSignIn(provider, { callbackUrl: "/" });
  };

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: "/" });
  };

  const value = useMemo<AuthContextType>(
    () => ({ isAuthenticated, user: session?.user ?? null, status, signIn, signOut }),
    [isAuthenticated, session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}