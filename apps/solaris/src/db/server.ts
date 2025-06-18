import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const isDev = process.env.NODE_ENV === 'development'

  const supabaseUrl = isDev
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEVELOPMENT
    : process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseAnonKey = isDev
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEVELOPMENT
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase server env vars are missing. Verifique suas variáveis de ambiente.')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Safe fallback: provavelmente chamado de Server Component
          // e `set` não é permitido — ignora com segurança
        }
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}
