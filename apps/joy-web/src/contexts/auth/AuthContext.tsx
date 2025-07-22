"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Loader } from "@/components/Loader";
import { login } from "@/actions/login.action";
import { ProviderType } from "@hexagano/backend";
import { useRouter } from "next/navigation";
import { User } from "@hexagano/backend";
import { authClient } from "@/betterauth/auth-client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (provider: ProviderType) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      // Primeiro tenta pegar sessão localmente
      const session = await authClient.getSession();
      const authUser = session.data?.user;

      if (!authUser) {
        setUser(null);
        return;
      }

      // Faz os dois fetches em paralelo
      const [profileRes] = await Promise.all([
        fetch("/api/user/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (!profileRes.ok)
        throw new Error("Erro ao buscar perfil do usuário (/user/profile)");

      const profileData = await profileRes.json();
      // Mapeia para User conforme esperado
      const parsedUser: User = {
        id: profileData.user.id,
        email: profileData.user.email,
        name: profileData.user?.name ?? "Sem nome",
        picture: profileData.user?.picture ?? "/user.png",
        genre: profileData.user?.genre || "",
        created_at: new Date(authUser.createdAt),
        bio: profileData.user?.bio || null,
        normalized_name: profileData.user?.normalized_name || null,
      };

      setUser(parsedUser);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signIn = useCallback(async (provider: ProviderType) => {
    await login(provider);
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <Loader.Spinner /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return context;
}
