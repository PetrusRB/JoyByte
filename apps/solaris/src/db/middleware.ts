import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NODE_ENV === 'development'
      ? process.env.SUPABASE_URL_DEVELOPMENT!
      : process.env.SUPABASE_URL!,
    process.env.NODE_ENV === 'development'
      ? process.env.SUPABASE_ANON_KEY_DEVELOPMENT!
      : process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Revalida sessão supabase (supabase.auth.getUser() consulta servidor)
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    const isLoginRoute = path.startsWith('/') || path.startsWith('/auth')
    // Se não está logado e não está em /login ou /auth, redireciona
    if (!user && !isLoginRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
    return response
}
