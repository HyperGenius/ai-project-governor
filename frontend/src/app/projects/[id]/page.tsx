/* frontend/src/app/projects/[id]/page.tsx */
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { fetcher } from '@/utils/fetcher'
import { updateTask, getMembers } from '@/services/projects'
import { Project, Profile } from '@/types'
import { toast } from 'sonner'
// UIコンポーネント
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Calendar, CheckCircle2, User as UserIcon, BarChart3 } from 'lucide-react'
// ガントチャート用
import { GanttChart } from '@/components/dashboard/GanttChart'

const STATUS_CONFIG = {
    todo: { label: '未着手', color: 'bg-gray-100 text-gray-700' },
    in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-700' },
    done: { label: '完了', color: 'bg-green-100 text-green-700' },
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)

    const [token, setToken] = React.useState<string | null>(null)
    const [members, setMembers] = React.useState<Profile[]>([])

    React.useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setToken(session.access_token)
                const m = await getMembers(session.access_token)
                setMembers(m)
            }
        }
        init()
    }, [])

    const API_URL = token ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${id}` : null
    const { data: project, isLoading, mutate } = useSWR<Project>(
        token ? [API_URL, token] : null,
        fetcher
    )

    // 汎用タスク更新ハンドラ
    const handleTaskUpdate = async (taskId: string, key: string, value: any) => {
        if (!token || !project) return

        // 1. 楽観的UI更新
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, [key]: value } : t
        )
        mutate({ ...project, tasks: updatedTasks }, false)

        try {
            // 2. API送信
            const payload = { [key]: value === 'unassigned' ? null : value }
            await updateTask(token, taskId, payload)
            toast.success('更新しました')
        } catch (e) {
            toast.error('更新に失敗しました')
            mutate() // ロールバック
        }
    }

    // ガントチャートからの日付更新
    const handleGanttUpdate = async (taskId: string, start: Date, end: Date) => {
        if (!token || !project) return

        // Date -> YYYY-MM-DD 文字列変換
        const startStr = start.toISOString().split('T')[0]
        const endStr = end.toISOString().split('T')[0]

        // 1. 楽観的UI更新
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, start_date: startStr, end_date: endStr } : t
        )
        mutate({ ...project, tasks: updatedTasks }, false)

        try {
            await updateTask(token, taskId, { start_date: startStr, end_date: endStr })
            toast.success('スケジュールを更新しました')
        } catch (e) {
            toast.error('更新に失敗しました')
            mutate()
        }
    }

    if (isLoading || !token) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
    if (!project) return <div className="p-8 text-center">プロジェクトが見つかりません</div>

    const totalTasks = project.tasks.length
    const doneTasks = project.tasks.filter(t => t.status === 'done').length
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
            {/* ヘッダーエリア (既存コード) */}
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.push('/')} className="pl-0 text-gray-500">
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
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>
                {project.description && (
                    <div className="bg-white p-4 rounded-lg border text-sm text-gray-700 whitespace-pre-wrap">{project.description}</div>
                )}
            </div>

            {/* ガントチャートエリア */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    ガントチャート
                </h2>
                <GanttChart tasks={project.tasks} onTaskUpdate={handleGanttUpdate} />
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
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* ステータス選択 */}
                                <div className="shrink-0 pt-1">
                                    <Select
                                        defaultValue={task.status}
                                        onValueChange={(val) => handleTaskUpdate(task.id, 'status', val)}
                                    >
                                        <SelectTrigger className={`w-[110px] h-8 text-xs ${STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG].color} border-none font-medium`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">未着手</SelectItem>
                                            <SelectItem value="in_progress">進行中</SelectItem>
                                            <SelectItem value="done">完了</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* タスク詳細 & 日付編集 */}
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <div className="font-bold text-gray-800">{task.title}</div>
                                        <div className="text-sm text-gray-600 line-clamp-1">{task.description}</div>
                                    </div>

                                    {/* 期間設定用の入力フィールド */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            className="h-7 w-[130px] text-xs"
                                            value={task.start_date || ''}
                                            onChange={(e) => handleTaskUpdate(task.id, 'start_date', e.target.value || null)}
                                        />
                                        <span className="text-gray-400 text-xs">〜</span>
                                        <Input
                                            type="date"
                                            className="h-7 w-[130px] text-xs"
                                            value={task.end_date || ''}
                                            onChange={(e) => handleTaskUpdate(task.id, 'end_date', e.target.value || null)}
                                        />
                                    </div>
                                </div>

                                {/* 工数 & 担当者 */}
                                <div className="shrink-0 flex flex-col items-end gap-2 min-w-[140px]">
                                    <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                                        想定: {task.estimated_hours}h
                                    </div>
                                    <Select
                                        value={task.assigned_to || "unassigned"}
                                        onValueChange={(val) => handleTaskUpdate(task.id, 'assigned_to', val)}
                                    >
                                        <SelectTrigger className="h-8 w-full text-xs">
                                            <div className="flex items-center gap-1 truncate">
                                                <UserIcon className="h-3 w-3" />
                                                <SelectValue placeholder="担当者" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">(未アサイン)</SelectItem>
                                            {members.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.full_name || 'No Name'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}