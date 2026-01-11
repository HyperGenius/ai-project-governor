/* frontend/src/services/profiles.ts */

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1/profiles'

export type AISettings = {
    tone: 'professional' | 'concise' | 'english' | 'enthusiastic'
    language: 'ja' | 'en'
    custom_instructions: string
}

export type AISettingsResponse = {
    ai_settings: AISettings
}

/**
 * 現在のユーザーのAI設定を取得する
 */
export async function getAISettings(token: string): Promise<AISettings> {
    const res = await fetch(`${API_BASE}/ai-settings`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('AI設定の取得に失敗しました')
    }

    const data: AISettingsResponse = await res.json()
    return data.ai_settings
}

/**
 * 現在のユーザーのAI設定を更新する
 */
export async function updateAISettings(
    token: string,
    settings: AISettings
): Promise<AISettings> {
    const res = await fetch(`${API_BASE}/ai-settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
    })

    if (!res.ok) {
        throw new Error('AI設定の更新に失敗しました')
    }

    const data: AISettingsResponse = await res.json()
    return data.ai_settings
}
