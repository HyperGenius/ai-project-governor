/* src/app/login/actions.ts */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // エラーページへリダイレクト（簡易実装）
        // 本来はstateを使って画面にエラーを表示するのがベストですが、まずはシンプルに
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}