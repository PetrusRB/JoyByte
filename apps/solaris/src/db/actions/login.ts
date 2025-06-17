'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/db/server'
import { Provider } from '@/types'

export async function login(provider: Provider) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
        },
    })
    if (data?.url) {
        redirect(data.url)
    }
    if (error) redirect('/error')
    revalidatePath('/', 'layout')
    redirect('/')
}
