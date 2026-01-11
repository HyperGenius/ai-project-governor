/* frontend/src/app/weeks/new/page.tsx */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { generateWeeklyReport, createWeeklyReport } from '@/services/weeks'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function NewWeeklyReportPage() {
    const router = useRouter()
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // 日付範囲（初期値：今週の月曜〜金曜）
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // 生成結果
    const [content, setContent] = useState('')

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) setToken(session.access_token)

            // 日付初期化
            const today = new Date()
            const day = today.getDay()
            const diffToMon = today.getDate() - day + (day === 0 ? -6 : 1)
            const monday = new Date(today.setDate(diffToMon))
            const friday = new Date(today.setDate(diffToMon + 4))

            setStartDate(monday.toISOString().split('T')[0])
            setEndDate(friday.toISOString().split('T')[0])
        }
        init()
    }, [])

    const handleGenerate = async () => {
        if (!token) return
        setLoading(true)
        try {
            const res = await generateWeeklyReport(token, {
                start_date: startDate,
                end_date: endDate
            })
            setContent(res.content_generated)
            toast.success('AIが週報を生成しました')
        } catch (e) {
            toast.error('生成に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!token || !content) return
        setLoading(true)
        try {
            await createWeeklyReport(token, {
                content,
                week_start_date: startDate,
                week_end_date: endDate
            })
            toast.success('週報を保存しました')
            router.push('/weeks') // 一覧へ遷移
        } catch (e) {
            toast.error('保存に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-3xl py-10 px-4 mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        週報の自動生成
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 期間設定 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>開始日 (Start)</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>終了日 (End)</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded text-sm text-blue-700">
                        💡 この期間に作成されたあなたの日報を集計し、AIが週報のドラフトを作成します。
                    </div>

                    <Button
                        className="w-full font-bold"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={loading || !token}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : '🤖 AIで生成する'}
                    </Button>

                    {/* 生成結果エリア */}
                    {content && (
                        <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center">
                                <Label>生成結果 (編集可能)</Label>
                                <Button size="sm" onClick={handleSave} disabled={loading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    この内容で保存
                                </Button>
                            </div>
                            <Textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="min-h-[400px] font-mono text-sm leading-relaxed"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}