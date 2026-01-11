/* frontend/src/app/reports/[id]/page.tsx */
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { fetcher } from '@/utils/fetcher'
import { Report } from '@/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Copy, Check, Clock } from 'lucide-react'
import { toast } from 'sonner'

/**
 * 日報詳細ページ
 * @param params 日報ID
 * @returns 入力された日報IDの詳細ページ
 */
export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)

    const [copied, setCopied] = React.useState(false)
    const [token, setToken] = React.useState<string | null>(null)

    React.useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) setToken(session.access_token)
        }
        init()
    }, [])

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const API_URL = `${API_BASE}/api/v1/reports/${id}`

    const { data: report, isLoading } = useSWR<Report>(
        token ? [API_URL, token] : null,
        fetcher
    )

    const handleCopy = () => {
        if (!report?.content_polished) return
        navigator.clipboard.writeText(report.content_polished)
        setCopied(true)
        toast.success('コピーしました')
        setTimeout(() => setCopied(false), 2000)
    }

    if (isLoading || !token) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
    }

    if (!report) {
        return <div className="p-8 text-center text-gray-500">日報が見つかりません</div>
    }

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 space-y-6">
            <Button variant="ghost" onClick={() => router.push('/')} className="pl-0 text-gray-500 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" /> ダッシュボードへ戻る
            </Button>

            {/* AI抽出実績エリア */}
            {report.task_work_logs && report.task_work_logs.length > 0 && (
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            AIが抽出した工数実績
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {report.task_work_logs.map(log => (
                                <div key={log.id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                    <span className="font-medium text-gray-700 truncate flex-1 mr-4">
                                        {log.tasks?.title || '（削除されたタスク）'}
                                    </span>
                                    <Badge variant="secondary" className="shrink-0">
                                        {log.hours} h
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 本文エリア */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">
                        {report.subject || '日報詳細'}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? 'コピー完了' : 'コピー'}
                    </Button>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm leading-relaxed text-gray-800 border">
                        {report.content_polished}
                    </div>
                    <div className="mt-8 pt-4 border-t">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">元のメモ</h3>
                        <div className="text-xs text-gray-400 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                            {report.content_raw}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}