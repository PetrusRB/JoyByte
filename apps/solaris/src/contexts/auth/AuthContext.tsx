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
    const fetchUser = async () => {
      try {
        const res = await ky.get("/api/auth/user").json<User>()

        // Criar um objeto parcial compatível e lançar como unknown antes de User
        const partialUser = {
          id: res.id,
          email: res.email,
          user_metadata: {
            full_name: res.name,
            avatar_url: res.avatar_url,
          },
          aud: res.aud,
          created_at: new Date().toISOString(),
        } as unknown as User

        setUser(partialUser)
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const signIn = useCallback(async (provider: Provider) => {
    await login(provider)
  }, [])

  const signOut = useCallback(async () => {
    await signout()
    setUser(null)
  }, [])

  const value = useMemo(
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
  if (!context) throw new Error("useAuth precisa estar dentro de <AuthProvider>")
  return context
}
