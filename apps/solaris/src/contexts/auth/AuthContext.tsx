"use client";

import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";

import Loading from "@/components/Loading";
import { login } from "@/db/actions/login";
import { User } from "@supabase/auth-js";
import { signout } from "@/db/actions/signout";
import supabase from "@/db";
import { Provider } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signIn: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoading(false);
    };

    fetchUser();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user;

  const signIn = async (provider: Provider) => {
    await login(provider);
  };

  const signOut = async () => {
    await signout();
    setUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({ isAuthenticated, isLoading, user, signIn, signOut }),
    [isAuthenticated, isLoading, user]
  );

  if (isLoading) {
    return <Loading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}