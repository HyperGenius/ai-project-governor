/* frontend/src/services/weeks.ts */
import { WeeklyReport } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1'

/**
 * 指定期間の日報から週報ドラフトをAI生成する（保存はしない）
 */
export async function generateWeeklyReport(
    token: string,
    range: { start_date: string; end_date: string }
): Promise<{ content_generated: string }> {
    const res = await fetch(`${API_BASE}/weeks/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(range),
    })

    if (!res.ok) throw new Error('AI生成に失敗しました')
    return res.json()
}

/**
 * 週報を確定保存する
 */
export async function createWeeklyReport(
    token: string,
    data: { content: string; week_start_date: string; week_end_date: string }
): Promise<WeeklyReport> {
    const res = await fetch(`${API_BASE}/weeks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })

    if (!res.ok) throw new Error('保存に失敗しました')
    return res.json()
}

// SWR用のFetcherは utils/fetcher.ts を使うため、ここではGet系は省略可だが、
// サーバーコンポーネント等で使う場合に備えて定義しておくのも良い