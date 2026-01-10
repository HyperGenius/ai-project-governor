/* frontend/src/app/projects/[id]/page.tsx */
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/utils/supabase/client'
import { fetcher } from '@/utils/fetcher'
import { updateTask } from '@/services/projects'
import { Project, Task } from '@/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

// ステータスの表示設定
const STATUS_CONFIG = {
    todo: { label: '未着手', color: 'bg-gray-100 text-gray-700' },
    in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-700' },
    done: { label: '完了', color: 'bg-green-100 text-green-700' },
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    // Next.js 15 (App Router) では params が Promise
    const { id } = React.use(params)

    // セッション取得（トークン用）
    const [token, setToken] = React.useState<string | null>(null)
    React.useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) setToken(session.access_token)
        }
        init()
    }, [])

    // SWRによるデータ取得
    const API_URL = token ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${id}` : null
    const { data: project, isLoading, mutate: mutateProject } = useSWR<Project>(
        token ? [API_URL, token] : null,
        fetcher
    )

    // タスク更新ハンドラ
    const handleStatusChange = async (taskId: string, newStatus: string) => {
        if (!token || !project) return

        // 1. 楽観的UI更新（APIレスポンスを待たずに画面を書き換える）
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus as any } : t
        )
        const updatedProject = { ...project, tasks: updatedTasks }

        // SWRのキャッシュを即時更新（revalidateは一旦オフ）
        mutateProject(updatedProject, false)

        try {
            // 2. API送信
            await updateTask(token, taskId, { status: newStatus })
            toast.success('ステータスを更新しました')
        } catch (e) {
            toast.error('更新に失敗しました')
            // エラー時は再取得して元に戻す
            mutateProject()
        }
    }

    if (isLoading || !token) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
    }

    if (!project) {
        return <div className="p-8 text-center">プロジェクトが見つかりません</div>
    }

    // 進捗率計算
    const totalTasks = project.tasks.length
    const doneTasks = project.tasks.filter(t => t.status === 'done').length
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4 space-y-8">
            {/* ヘッダーエリア */}
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.push('/')} className="pl-0 hover:pl-0 hover:bg-transparent text-gray-500">
                    <ArrowLeft className="mr-2 h-4 w-4" /> ダッシュボードへ戻る
                </Button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {project.start_date} 〜 {project.end_date}
                            </span>
                            <Badge variant="outline">{project.status}</Badge>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{progress}%</div>
                        <div className="text-xs text-gray-500">完了 / 全体</div>
                    </div>
                </div>

                {/* 進捗バー */}
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {project.description && (
                    <div className="bg-white p-4 rounded-lg border text-sm text-gray-700 whitespace-pre-wrap">
                        {project.description}
                    </div>
                )}
            </div>

            {/* タスクリストエリア */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    タスク一覧
                </h2>
                <div className="space-y-3">
                    {project.tasks.map((task) => (
                        <Card key={task.id} className="transition-all hover:shadow-sm">
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* ステータス選択 */}
                                <div className="shrink-0">
                                    <Select
                                        defaultValue={task.status}
                                        onValueChange={(val) => handleStatusChange(task.id, val)}
                                    >
                                        <SelectTrigger className={`w-[130px] ${STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG].color} border-none font-medium`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">未着手</SelectItem>
                                            <SelectItem value="in_progress">進行中</SelectItem>
                                            <SelectItem value="done">完了</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* タスク詳細 */}
                                <div className="flex-1 space-y-1">
                                    <div className="font-bold text-gray-800">{task.title}</div>
                                    <div className="text-sm text-gray-600 line-clamp-1">{task.description}</div>
                                </div>

                                {/* 担当者・工数 */}
                                <div className="shrink-0 flex items-center gap-4 text-sm text-gray-500 min-w-[150px] justify-end">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {task.estimated_hours}h
                                        </span>
                                    </div>
                                    {/* TODO: 担当者名の表示 (ID解決が必要なので今回は簡易表示) */}
                                    {/* <Avatar className="h-8 w-8" /> */}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}