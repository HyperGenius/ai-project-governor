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

/**
 * 指定されたIDの日報詳細を取得する
 * @param id 日報ID
 * @param accessToken API認証用のアクセストークン
 */
export async function getReportById(id: string, accessToken: string): Promise<Report | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        // 毎回最新を取得
        cache: 'no-store',
    })

    if (res.status === 404) {
        return null
    }

    if (!res.ok) {
        console.error(`Failed to fetch report ${id}`)
        // エラーページへ飛ばすなどの処理も検討可能ですが、一旦nullで返す
        return null
    }

    return res.json()
}

/**
 * 指定されたIDの日報を削除する
 * @param id 日報ID
 * @param accessToken API認証用のアクセストークン
 */
export async function deleteReport(id: string, accessToken: string): Promise<boolean> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    return res.ok
}