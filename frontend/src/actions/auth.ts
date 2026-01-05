/* frontend/src/actions/auth.ts */
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * ログアウトアクション
 */
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // キャッシュをクリアしてログイン画面へ
    revalidatePath('/', 'layout')
    redirect('/login')
}