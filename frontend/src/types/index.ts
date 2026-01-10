/* frontend/src/types/index.ts */

// 日報
export type Report = {
    id: string
    subject: string | null
    content_polished: string | null
    content_raw: string
    politeness_level: number
    report_date: string
    created_at: string
}

// プロフィール
export type Profile = {
    id: string
    full_name: string | null
    role: string | null
}

// タスク
export type TaskDraft = {
    title: string
    description: string
    estimated_hours: number
    suggested_role: string
    assigned_to: string | null // ユーザーID
}

// プロジェクト
export type Project = {
    id: string
    name: string
    description: string | null
    status: string
    start_date: string | null
    end_date: string | null
    created_at: string
    tasks: {
        id: string
        status: string // 'todo', 'in_progress', 'done'
    }[]
}