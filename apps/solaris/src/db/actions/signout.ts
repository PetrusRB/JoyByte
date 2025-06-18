'use server'
import { redirect } from 'next/navigation'
import { createClient } from '../server'

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

export async function signout() {
  const supabase = await createClient()

  const {error} = await supabase.auth.signOut()

  if(error){
    // Fallback se URL ausente
    redirectToError({
      error: error.name,
      message: `${error.message}`
    })
  }

  // Fallback se URL ausente
  redirect("/")
}
