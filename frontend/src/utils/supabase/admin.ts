/* frontend/src/utils/supabase/admin.ts */
import { createClient } from '@supabase/supabase-js'

/**
 * Service Role Keyを使用したAdminクライアントを作成する
 * 注意: この関数はサーバーサイド（Server Actions, API Routes）でのみ使用すること
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}