/* src/utils/supabase/server.ts */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 環境変数からサーバーサイドクライアント作成
 * NEXT_PUBLIC_SUPABASE_URL: Supabase URL
 * NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase Anon Key
 * @returns Supabaseクライアント
 */
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server Action以外でcookie操作しようとするとエラーになるが、
                        // Middleware等での利用時は無視してOKな場合があるためtry-catchする
                    }
                },
            },
        }
    )
}