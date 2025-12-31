/* src/utils/supabase/client.ts */
import { createBrowserClient } from '@supabase/ssr'

/**
 * 環境変数からSupabaseクライアントを作成
 * @returns Supabaseクライアント
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
