import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/db/server'
import { serialize } from 'cookie'

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin
  const response = NextResponse.redirect(`${origin}/`, {
    status: 302,
  })

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro ao deslogar:', error.message)
      return NextResponse.json({ error: 'Erro ao sair da conta.' }, { status: 500 })
    }

    // Limpa cookies do Supabase
    response.headers.set(
      'Set-Cookie',
      [
        // Nome padrão dos cookies da Supabase SSR (pode ajustar se necessário)
        serialize('sb-access-token', '', {
          path: '/',
          maxAge: -1,
        }),
        serialize('sb-refresh-token', '', {
          path: '/',
          maxAge: -1,
        }),
      ].join(', ')
    )

    return response
  } catch (err) {
    console.error('Erro inesperado no logout:', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
