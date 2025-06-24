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
import { Loading } from "@/components/Loading";
import { login } from "@/db/actions/login";
import { signout } from "@/db/actions/signout";
import { Provider } from "@/types";
import supabase from "@/db";
import { useRouter } from "next/navigation";
import { client } from "@/libs/orpc";
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
      const session = await supabase.auth.getSession();
      const authUser = session.data.session?.user;

      if (!authUser) {
        setUser(null);
        return;
      }

      // Agora sim, usa o auth.me() + profile
      const [authRes, profileRes] = await Promise.all([
        client.auth.me(),
        client.user.me(),
      ]);

      const parsedUser: User = {
        id: authRes.id,
        email: authRes.email,
        name: authRes.name,
        genre: profileRes.user.genre || "",
        picture: authRes.picture,
        aud: authRes.aud || "authenticated",
        created_at: authRes.created_at,
        bio: profileRes.user.bio || null,
        normalized_name: profileRes.user.normalized_name || null,
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
      {isLoading ? <Loading /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return context;
}
