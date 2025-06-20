"use client"

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react"
import { Loading } from "@/components/Loading"
import { login } from "@/db/actions/login"
import { signout } from "@/db/actions/signout"
import ky from "ky"
import { Provider, User } from "@/types"
import supabase from "@/db" // o client do supabase (importa do client, não do server)
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (provider: Provider) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Função para carregar o usuário atual
  const fetchUser = async () => {
    try {
      const session = await supabase.auth.getSession()

      if (!session.data.session) {
        setUser(null)
        return
      }

      const res = await ky.get("/api/auth/user").json<any>()
      const parsedUser: User = {
        id: res.id,
        email: res.email,
        picture: res.picture || "/user.png",
        aud: res.aud || "authenticated",
        created_at: res.created_at || new Date().toISOString(),
        name: res.name || "Misterioso(a)",
      }
      setUser(parsedUser)
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    fetchUser()

    // 🔁 Evento de login/logout do Supabase
    supabase.auth.getSession().then(({data}) => {
      if (!isMounted) return

      if (data.session) {
        fetchUser()
        console.log("Fetched user");
        router.refresh()
      }
    })

    return () => {
      isMounted = false
    }
  }, [router])

  const signIn = useCallback(async (provider: Provider) => {
    await login(provider) // redireciona, se sucesso
  }, [])

  const signOut = useCallback(async () => {
    await signout() // <- já faz logout no server
    await supabase.auth.signOut() // <- client logout
    setUser(null) // <- OK manter isso aqui
    router.refresh()
  }, [router])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut]
  )

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <Loading /> : children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error("useAuth precisa estar dentro de <AuthProvider>")
  return context
}
