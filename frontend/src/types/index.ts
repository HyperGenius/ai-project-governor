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
    task_work_logs: WorkLog[]
}

// プロフィール
export type Profile = {
    id: string
    full_name: string | null
    role: string | null
}

// AIが提案するタスク
export type TaskDraft = {
    title: string
    description: string
    estimated_hours: number
    suggested_role: string
    assigned_to: string | null // ユーザーID
}

// DBに保存されたタスク
export type Task = {
    id: string
    project_id: string
    title: string
    description: string
    status: 'todo' | 'in_progress' | 'done'
    estimated_hours: number
    suggested_role: string
    assigned_to: string | null
    created_at: string
    start_date: string | null
    end_date: string | null
}

// プロジェクト
export type Project = {
    id: string
    name: string
    description: string | null
    status: string
    start_date: string | null
    end_date: string | null
    milestones: string | null
    created_at: string
    tasks: Task[] // 詳細情報を含むTask型に変更
}

// 自分の担当タスク（入力補助用）
export type ActiveTask = {
    id: string
    title: string
    project_name: string
}

// 工数ログ
export type WorkLog = {
    id: string
    task_id: string
    hours: number
    tasks: {
        title: string
    }
}

// 週報
export type WeeklyReport = {
    id: string
    content: string
    week_start_date: string
    week_end_date: string
    created_at: string
}

// 対話型スコーピング用の型
export type ChatMessage = {
    role: 'user' | 'assistant'
    content: string
}

export type ScopingChatResponse = {
    message: string
    is_complete: boolean
    wbs_data: {
        name: string
        description: string
        start_date: string
        end_date: string
        milestones: string
        tasks: TaskDraft[]
    } | null
}