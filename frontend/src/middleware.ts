/* src/utils/supabase/middleware.ts */
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

/**
 * ミドルウェアを動かすべきパスを指定
 */
export const config = {
    matcher: [
        /*
         * 以下のパスを除外して、それ以外すべてのリクエストでミドルウェアを動かす
         * - _next/static (静的ファイル)
         * - _next/image (画像最適化)
         * - favicon.ico (ファビコン)
         * - 画像ファイル拡張子 (svg, png, jpg, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}