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
import { login } from "@/db/actions/login";
import { signout } from "@/db/actions/signout";
import { Provider } from "@/types";
import supabase from "@/db";
import { useRouter } from "next/navigation";
import { User } from "@/schemas/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (provider: Provider) => Promise<void>;
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
      const session = await supabase.auth.getUser();
      const authUser = session.data?.user;

      if (!authUser) {
        setUser(null);
        return;
      }

      // Faz os dois fetches em paralelo
      const [authRes, profileRes] = await Promise.all([
        fetch("/api/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/user/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (!authRes.ok)
        throw new Error("Erro ao buscar dados do usuário (/auth/me)");
      if (!profileRes.ok)
        throw new Error("Erro ao buscar perfil do usuário (/user/profile)");

      const authData = await authRes.json();
      const profileData = await profileRes.json();
      // Mapeia para User conforme esperado
      const parsedUser: User = {
        id: authData.id,
        email: authData.email,
        name: profileData.user?.raw_user_meta_data.name,
        genre: profileData.user?.genre || "",
        picture: profileData.user?.raw_user_meta_data.picture,
        user_metadata: profileData.user?.raw_user_meta_data || {},
        aud: authData.aud || "authenticated",
        created_at: new Date(authData.created_at),
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
    fetchUser(); // Apenas uma vez no mount

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetchUser(); // Atualiza quando login/logout ocorre
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (provider: Provider) => {
    await login(provider);
  }, []);

  const signOut = useCallback(async () => {
    await signout();
    await supabase.auth.signOut();
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
