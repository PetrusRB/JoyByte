import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './db/server';

// Verifica se a rota é privada (dentro do segmento (privado))
const isPrivateRoute = (pathname: string): boolean => {
  return /^\/(?:\(privado\)|privado)(?:\/.*)?$/.test(pathname);
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Inicializa o Supabase com cookies do request/response
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (isPrivateRoute(request.nextUrl.pathname) && !data.user) {
    // Redireciona usuário não autenticado para login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    "/(en|pt-br)/:path*", "/", "/(privado)(.*)", "/(privado)"
  ],
}
