import { createBrowserClient } from "@supabase/ssr";

export function createClientForBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env vars are missing. Check your environment configuration.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export default createClientForBrowser;
