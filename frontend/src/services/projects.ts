/* frontend/src/services/projects.ts */
import { Profile, Project, TaskDraft, Task } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1'

/**
 * プロジェクト概要からWBS(タスク案)を生成する
 */
export async function generateWBS(
    token: string,
    data: { name: string; description: string; start_date: string; end_date: string; milestones: string }
): Promise<{ tasks: TaskDraft[] }> {
    const res = await fetch(`${API_BASE}/projects/generate-wbs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('AI生成に失敗しました')
    return res.json()
}

/**
 * プロジェクトとタスクを確定保存する
 */
export async function createProject(
    token: string,
    projectData: any // 型は適宜厳密に
): Promise<boolean> {
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(projectData),
    })
    return res.ok
}

/**
 * メンバー一覧を取得する
 */
export async function getMembers(token: string): Promise<Profile[]> {
    const res = await fetch(`${API_BASE}/members`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    return res.json()
}

/**
 * プロジェクト一覧を取得する
 */
export async function getProjects(token: string): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        console.error('Failed to fetch projects')
        return []
    }

    return res.json()
}

/**
 * プロジェクト詳細を取得する
 */
export async function getProjectById(token: string, projectId: string): Promise<Project | null> {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) return null
    return res.json()
}

/**
 * タスクのステータス等を更新する
 */
export async function updateTask(
    token: string,
    taskId: string,
    data: { status?: string; assigned_to?: string }
): Promise<Task | null> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })

    if (!res.ok) return null
    return res.json()
}