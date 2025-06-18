import { createBrowserClient } from '@supabase/ssr'

export function createClientForBrowser() {
  const isDev = process.env.NODE_ENV === 'development'

  const supabaseUrl = isDev
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEVELOPMENT
    : process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseAnonKey = isDev
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEVELOPMENT
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars are missing. Check your environment configuration.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export default createClientForBrowser
