/* frontend/src/app/reports/new/page.tsx */
'use client'

import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { createReport } from '@/services/reports'
import { getMyActiveTasks } from '@/services/projects'
import { getAISettings, AISettings } from '@/services/profiles'
import { ActiveTask } from '@/types'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Loader2, Plus, Briefcase, Settings } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// 丁寧度の説明マップ
const LEVEL_DESCRIPTIONS: Record<number, string> = {
    1: 'Lv.1 【簡潔・社内向け】 事実のみを伝える、非常に短い文章。',
    2: 'Lv.2 【普通・同僚向け】 「です・ます」調の標準的な日報。',
    3: 'Lv.3 【丁寧・上司向け】 失礼のない、しっかりとしたビジネス文書。',
    4: 'Lv.4 【高尚・役員向け】 謙譲語・尊敬語を用いた格調高い文章。',
    5: 'Lv.5 【謝罪・緊急時】 深い反省や配慮を示す、最大限に慎重な表現。',
}

// トーン設定のラベル
const TONE_LABELS: Record<string, string> = {
    professional: 'プロフェッショナル（標準）',
    concise: '簡潔・社内向け',
    english: '英語（English）',
    enthusiastic: '熱血営業マン',
}

/**
 * 新規日報作成ページ
 * @returns 新規日報作成ページ
 */
export default function NewReportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')
    const [politeness, setPoliteness] = useState(3)

    // タスク一覧の状態
    const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([])
    
    // AI設定の状態
    const [aiSettings, setAiSettings] = useState<AISettings | null>(null)

    // 初期化時にタスク一覧とAI設定を取得
    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const tasks = await getMyActiveTasks(session.access_token)
                setActiveTasks(tasks)
                
                try {
                    const settings = await getAISettings(session.access_token)
                    setAiSettings(settings)
                } catch (error) {
                    console.error('AI設定の取得に失敗:', error)
                }
            }
        }
        init()
    }, [])

    const handleSubmit = async () => {
        if (!content.trim()) return

        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/login')
                return
            }

            // 作成APIをコール
            await createReport(session.access_token, {
                raw_content: content,
                politeness_level: politeness
            })

            toast.success('日報を作成しました！')
            router.push('/')
        } catch (error) {
            toast.error('作成に失敗しました')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // タスクチップクリック時のハンドラ
    const insertTask = (taskTitle: string) => {
        // カーソル位置への挿入などは省略し、末尾に追加する簡易実装
        const textToAdd = `\n- 【${taskTitle}】に取り組んだ。`
        setContent(prev => prev + textToAdd)
    }

    return (
        <div className="container max-w-2xl py-10 px-4 mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>日報を作成</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* タスク入力補助エリア */}
                    {activeTasks.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-500">
                                <Briefcase className="w-3 h-3 inline mr-1" />
                                担当タスク（クリックで挿入）
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {activeTasks.map(task => (
                                    <Badge
                                        key={task.id}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors py-1 px-3"
                                        onClick={() => insertTask(task.title)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        {task.title}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>今日の業務内容（箇条書きでOK）</Label>
                        <Textarea
                            placeholder="・〇〇機能の実装をした&#13;&#10;・設計についてXXさんと相談した"
                            className="h-48 resize-none text-base"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* AI設定が有効な場合の表示 */}
                    {aiSettings && aiSettings.custom_instructions ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>AIカスタム設定（有効）</Label>
                                <Link href="/settings">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                        <Settings className="w-4 h-4 mr-1" />
                                        設定を変更
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                <div>
                                    <span className="text-sm font-semibold text-blue-900">トーン: </span>
                                    <span className="text-sm text-blue-700">{TONE_LABELS[aiSettings.tone]}</span>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold text-blue-900">カスタム指示:</div>
                                    <div className="bg-white border border-blue-100 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                        {aiSettings.custom_instructions}
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-xs text-gray-500">
                                ※ AI補正レベルは無効になっています。カスタム設定で日報が生成されます。
                            </p>
                        </div>
                    ) : (
                        // 通常のAI補正レベル設定
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>AI補正レベル (丁寧さ)</Label>
                                <span className="text-sm font-bold text-blue-600">Level {politeness}</span>
                            </div>
                            <Slider
                                defaultValue={[politeness]}
                                max={5}
                                min={1}
                                step={1}
                                onValueChange={(vals) => setPoliteness(vals[0])}
                            />
                            <p className="text-xs text-gray-500 text-right">
                                {politeness === 5 ? '最大（JTC準拠）' : politeness === 1 ? '最小（そのまま）' : '標準'}
                            </p>
                            {aiSettings && (
                                <p className="text-xs text-gray-500">
                                    ※ トーン: {TONE_LABELS[aiSettings.tone]} | <Link href="/settings" className="text-blue-600 hover:underline">カスタム設定</Link>
                                </p>
                            )}
                        </div>
                    )}

                    <Button
                        className="w-full font-bold"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={loading || !content.trim()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                AIが清書中...
                            </>
                        ) : (
                            '日報を作成する'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}