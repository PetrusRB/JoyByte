import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/db/server'
import { Provider } from '@/types'

// Lista branca de providers suportados
const SUPPORTED_PROVIDERS = ['google', 'github', 'facebook'] as const

export async function POST(request: NextRequest) {
  try{
    const body = await request.json()
    const rawProvider = (body?.provider || '').toLowerCase()

    // Checa se provider é válido e suportado
    if (!SUPPORTED_PROVIDERS.includes(rawProvider as Provider)) {
      return NextResponse.json(
        { error: 'Provedor inválido ou não suportado.' },
        { status: 400 }
      )
    }

    const origin = request.nextUrl.origin
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: rawProvider as Provider,
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    })

    if (error || !data?.url) {
      console.error('Erro no login OAuth:', error)
      return NextResponse.json({ error: 'Erro ao iniciar login OAuth.' }, { status: 500 })
    }

    return NextResponse.redirect(data.url, {
      status: 302, // Use 302 para redirecionamentos de OAuth
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
