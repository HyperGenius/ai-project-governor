/* frontend/src/services/reports.ts */
import { Report } from '@/types'

/**
 * APIから日報一覧を取得する
 * @param accessToken API認証用のアクセストークン
 */
export async function getReports(accessToken: string): Promise<Report[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
    })

    if (!res.ok) {
        console.error('Failed to fetch reports')
        // 必要に応じてエラーをthrowする、あるいは空配列を返す
        return []
    }

    return res.json()
}
