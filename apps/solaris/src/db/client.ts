import { createBrowserClient } from '@supabase/ssr'

const createClientForBrowser = () =>
  createBrowserClient(
    process.env.NODE_ENV === 'development'
      ? process.env.SUPABASE_URL_DEVELOPMENT!
      : process.env.SUPABASE_URL!,
    process.env.NODE_ENV === 'development'
      ? process.env.SUPABASE_ANON_KEY_DEVELOPMENT!
      : process.env.SUPABASE_ANON_KEY!,
  )

export default createClientForBrowser
