import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

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
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const path = request.nextUrl.pathname;

    const isPrivateRoute = /^\/(\(privado\)|privado)(\/|$)/.test(path);

    if (isPrivateRoute) {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/";
        return NextResponse.redirect(redirectUrl);
      }
    }

    return response;
}
