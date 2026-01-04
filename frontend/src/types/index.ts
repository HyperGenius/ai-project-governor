/* frontend/src/types/index.ts */

/**
 * 日報の型定義
 */
export type Report = {
    id: string
    subject: string | null
    content_polished: string | null
    politeness_level: number
    report_date: string
    created_at: string
}