/* frontend/src/services/reports.ts */
import { Report } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1/reports'

type CreateReportDraft = {
    raw_content: string
    politeness_level: number
}

/**
 * 日報を新規作成する (AI生成含む)
 */
export async function createReport(token: string, draft: CreateReportDraft): Promise<Report> {
    const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
    })

    if (!res.ok) {
        throw new Error('日報の作成に失敗しました')
    }

    return res.json()
}

/**
 * 日報一覧を取得する (Dashboard用)
 * ※ SWRを使う場合は fetcher を直接使うことも多いですが、
 * SSRや別の場所で使うためにサービス関数としても用意しておくと便利です
 */
export async function getReports(token: string): Promise<Report[]> {
    const res = await fetch(`${API_BASE}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('日報一覧の取得に失敗しました')
    }

    return res.json()
}

/**
 * 日報詳細を取得する
 */
export async function getReportById(token: string, id: string): Promise<Report> {
    const res = await fetch(`${API_BASE}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('日報詳細の取得に失敗しました')
    }

    return res.json()
}

/**
 * 日報を更新する
 * @param token トークン
 * @param id 日報ID
 * @param data 更新するデータ（件名、本文）
 */
export async function updateReport(
    token: string,
    id: string,
    data: { subject?: string; content_polished?: string }
): Promise<Report | null> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        return null
    }

    return res.json()
}

/**
 * 指定されたIDの日報を削除する
 * @param token API認証用のアクセストークン
 * @param id 日報ID
 */
export async function deleteReport(token: string, id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    return res.ok
}