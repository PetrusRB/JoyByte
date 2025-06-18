'use server'

import { redirect } from 'next/navigation'
import { Provider } from '@/types'
import { createClient } from '../server'

// Lista branca de providers suportados
const SUPPORTED_PROVIDERS = ['google', 'github', 'facebook'] as const

// Server-safe redirect wrapper
function redirectToError(params: {
  error: string
  provider?: string
  code?: number
  message?: string
  details?: string
}) {
  redirect(`/error?message=${params.message}&code=${params.code}`)
}

export async function login(provider: Provider) {
  // Checa se provider é válido e suportado
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    // Fallback se URL ausente
    redirectToError({
      error: 'server_error',
      provider,
      message: 'URL de redirecionamento ausente.'
    })
  }
  const origin = process.env.NEXT_PUBLIC_BASE_URL
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if(error){
    // Fallback se URL ausente
    redirectToError({
      error: error.name,
      provider,
      message: `${error.message}`,
      details: JSON.stringify(data),
    })
  }

  if (data?.url) {
    console.log("Funcionou.")
    redirect(data.url)
  }

  // Fallback se URL ausente
  redirectToError({
    error: 'server_error',
    provider,
    message: 'URL de redirecionamento ausente.',
    details: JSON.stringify(data),
  })
}
