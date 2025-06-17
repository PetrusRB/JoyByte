import { NextResponse } from 'next/server'
import { createClient } from '@/db/server'

export async function POST(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()
  await supabase.auth.signOut()
  // Redireciona ao sair
  return NextResponse.redirect(origin + '/')
}
