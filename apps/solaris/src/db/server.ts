import { CookieOptions, createServerClient } from '@supabase/ssr'
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
      get(name: string) {
               return cookieStore.get(name)?.value;
             },
             set(name: string, value: string, options: CookieOptions) {
               try {
                 cookieStore.set({ name, value, ...options });
               } catch (error) {
                 // The `set` method was called from a Server Component.
                 // This can be ignored if you have middleware refreshing
                 // user sessions.
               }
             },
             remove(name: string, options: CookieOptions) {
               try {
                 cookieStore.set({ name, value: "", ...options });
               } catch (error) {
                 // The `delete` method was called from a Server Component.
                 // This can be ignored if you have middleware refreshing
                 // user sessions.
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
