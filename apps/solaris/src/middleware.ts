import { type NextRequest } from 'next/server'
import { updateSession } from './db/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    "/(en|pt-br)/:path*", "/", "/(privado)(.*)"
  ],
}
