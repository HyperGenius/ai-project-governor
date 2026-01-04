/* frontend/src/actions/auth.ts */
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * ログアウトアクション
 */
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}