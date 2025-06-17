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

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const res = await ky.get("/api/auth/user").json<any>()

        if (
          res &&
          typeof res.id === "string" &&
          typeof res.email === "string" &&
          typeof res.name === "string" &&
          typeof res.picture === "string" &&
          typeof res.aud === "string" &&
          typeof res.name === "string" &&
          typeof res.avatar_url === "string"
        ) {
          const parsedUser: User = {
            id: res.id,
            email: res.email,
            picture: res.picture || "/user.png",
            aud: res.aud || "authenticated",
            created_at: res.created_at || new Date().toISOString(),
            name: res.name || "Misterioso(a)",
          }

          if (isMounted) setUser(parsedUser)
        } else {
          console.warn("Usuário com dados inválidos:", res)
          if (isMounted) setUser(null)
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [])

  const signIn = useCallback(async (provider: Provider) => {
    await login(provider)
  }, [])

  const signOut = useCallback(async () => {
    await signout()
    setUser(null)
  }, [])

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
