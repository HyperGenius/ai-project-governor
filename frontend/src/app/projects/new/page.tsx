/* frontend/src/app/projects/new/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { generateWBS, createProject, getMembers } from '@/services/projects'
import { Profile, TaskDraft } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Trash2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import ScopingChat from '@/components/projects/ScopingChat'

export default function NewProjectPage() {
    const router = useRouter()
    const [step, setStep] = useState<'input' | 'chat' | 'review'>('input')
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<Profile[]>([])

    // 入力フォームの状態
    const [form, setForm] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        milestones: ''
    })

    // AI生成されたタスクの状態
    const [tasks, setTasks] = useState<TaskDraft[]>([])

    // 初期化時にメンバー一覧を取得
    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const fetchedMembers = await getMembers(session.access_token)
                setMembers(fetchedMembers)
            }
        }
        init()
    }, [])

    // 対話モードを開始する
    const handleStartChat = () => {
        if (!form.description || form.description.length < 10) {
            toast.error('プロジェクトの概要を10文字以上入力してください')
            return
        }
        setStep('chat')
    }

    // AIによるWBS生成ハンドラ（従来の一発生成）
    const handleGenerate = async () => {
        if (!form.name || !form.description) {
            toast.error('プロジェクト名と目的は必須です')
            return
        }
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const result = await generateWBS(session.access_token, form)

            // 担当者は初期値nullでセット
            const tasksWithAssignee = result.tasks.map(t => ({ ...t, assigned_to: null }))
            setTasks(tasksWithAssignee)
            setStep('review')
            toast.success('プランニングが完了しました！')
        } catch (e) {
            console.error('Failed to generate WBS:', e)
            toast.error('AI生成中にエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    // 対話完了時のハンドラ
    const handleChatComplete = (projectData: {
        name: string
        description: string
        start_date: string
        end_date: string
        milestones: string
        tasks: TaskDraft[]
    }) => {
        // フォームデータを更新
        setForm({
            name: projectData.name,
            description: projectData.description,
            start_date: projectData.start_date,
            end_date: projectData.end_date,
            milestones: projectData.milestones
        })
        // タスクを設定（担当者は初期値null）
        const tasksWithAssignee = projectData.tasks.map(t => ({ ...t, assigned_to: null }))
        setTasks(tasksWithAssignee)
        // レビュー画面に移動
        setStep('review')
    }

    // プロジェクト保存ハンドラ
    const handleSave = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const payload = { ...form, tasks }
            const success = await createProject(session.access_token, payload)

            if (success) {
                toast.success('プロジェクトを作成しました')
                router.push('/')
            } else {
                throw new Error()
            }
        } catch (e) {
            console.error('Failed to save project:', e)
            toast.error('保存に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    // --- タスク編集用ヘルパー ---
    const updateTask = (index: number, key: keyof TaskDraft, value: string | number | null) => {
        const newTasks = [...tasks]
        newTasks[index] = { ...newTasks[index], [key]: value }
        setTasks(newTasks)
    }

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index))
    }

    // --- STEP 1: 入力画面 ---
    if (step === 'input') {
        return (
            <div className="container max-w-2xl py-10 px-4 mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>新規プロジェクト・プランニング</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>プロジェクト名（任意）</Label>
                            <Input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="例: 新規SaaS開発プロジェクト"
                            />
                            <p className="text-xs text-gray-500 mt-1">※対話モードの場合、AIが提案してくれます</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>開始日（任意）</Label>
                                <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                            </div>
                            <div>
                                <Label>終了日（任意）</Label>
                                <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <Label>プロジェクトの目的 (Mission) *</Label>
                            <Textarea
                                className="h-32"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="例: ECサイトを作りたい"
                            />
                            <p className="text-xs text-gray-500 mt-1">※対話モードでは、ここから質問が始まります</p>
                        </div>
                        <div>
                            <Label>マイルストーン (任意)</Label>
                            <Textarea
                                value={form.milestones}
                                onChange={e => setForm({ ...form, milestones: e.target.value })}
                                placeholder="例: 要件定義→設計→実装→テスト"
                            />
                        </div>

                        {/* 2つのボタン：対話モードと従来の一発生成 */}
                        <div className="space-y-2">
                            <Button className="w-full" onClick={handleStartChat}>
                                <MessageSquare className="mr-2 w-4 h-4" />
                                💬 AIとの対話で要件を明確化（推奨）
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={handleGenerate} 
                                disabled={loading || !form.name || !form.description}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : '🤖'}
                                一発でWBSを生成する（従来方式）
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // --- STEP 2: チャット画面 ---
    if (step === 'chat') {
        return (
            <ScopingChat
                initialDescription={form.description}
                onComplete={handleChatComplete}
                onCancel={() => setStep('input')}
            />
        )
    }

    // --- STEP 3: レビュー画面 ---
    return (
        <div className="container py-8 px-4 mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 左側: プロジェクト情報 */}
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader><CardTitle>プロジェクト概要</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p className="font-bold text-lg">{form.name}</p>
                        <p className="text-gray-500">{form.start_date} 〜 {form.end_date}</p>
                        <div className="bg-gray-50 p-2 rounded">{form.description}</div>
                        <Button variant="outline" size="sm" onClick={() => setStep('input')}>
                            条件を修正して再生成
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* 右側: タスクリスト */}
            <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">生成されたタスク ({tasks.length}件)</h2>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? '保存中...' : '🚀 この内容でプロジェクト開始'}
                    </Button>
                </div>

                <div className="space-y-3">
                    {tasks.map((task, i) => (
                        <Card key={i} className="relative">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={task.title}
                                            onChange={(e) => updateTask(i, 'title', e.target.value)}
                                            className="font-bold"
                                        />
                                        <Textarea
                                            value={task.description}
                                            onChange={(e) => updateTask(i, 'description', e.target.value)}
                                            className="text-sm text-gray-600 min-h-[60px]"
                                        />
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                AI提案: {task.suggested_role}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span>工数:</span>
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8"
                                                    value={task.estimated_hours}
                                                    onChange={(e) => updateTask(i, 'estimated_hours', parseInt(e.target.value))}
                                                />
                                                <span>h</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 担当者アサイン */}
                                    <div className="w-48 shrink-0">
                                        <Label className="text-xs text-gray-500 mb-1 block">担当者</Label>
                                        <select
                                            className="w-full border rounded p-2 text-sm"
                                            value={task.assigned_to || ''}
                                            onChange={(e) => updateTask(i, 'assigned_to', e.target.value || null)}
                                        >
                                            <option value="">(未アサイン)</option>
                                            {members.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.full_name || '名称未設定'} ({m.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-red-500 absolute top-2 right-2"
                                        onClick={() => removeTask(i)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}