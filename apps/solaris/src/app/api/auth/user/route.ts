import { NextResponse } from 'next/server'
import { createClient } from '@/db/server'
import { User } from '@/types'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({
      error: error?.message || 'Usuário não autenticado',
    }, { status: 401 })
  }

  return NextResponse.json<User>({
    id: user.id,
    email: user.email,
    aud: user.aud,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    picture: user.user_metadata?.picture || null,
    created_at: user.created_at ? new Date(user.created_at) : new Date()
  })
}
