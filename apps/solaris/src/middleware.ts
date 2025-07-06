import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Verifica se a rota é privada (prefixo "/privado" ou dentro de "(privado)")
const isPrivateRoute = (pathname: string): boolean => {
  return /^\/(?:\(privado\)|privado)(?:\/.*)?$/.test(pathname);
};

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Se for rota privada e o usuário não está logado, redireciona
  if (isPrivateRoute(request.nextUrl.pathname) && !sessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(en|pt-br)/:path*",
    "/",
    "/(privado)(.*)",
    "/(privado)",
  ],
};
