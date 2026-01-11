/* frontend/src/app/weeks/[id]/page.tsx */
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { fetcher } from '@/utils/fetcher'
import { WeeklyReport } from '@/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Calendar, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function WeeklyReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)
    const [token, setToken] = React.useState<string | null>(null)
    const [copied, setCopied] = React.useState(false)

    React.useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) setToken(session.access_token)
        }
        init()
    }, [])

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const { data: report, isLoading } = useSWR<WeeklyReport>(
        token ? [`${API_BASE}/api/v1/weeks/${id}`, token] : null,
        fetcher
    )

    const handleCopy = () => {
        if (!report) return
        navigator.clipboard.writeText(report.content)
        setCopied(true)
        toast.success('コピーしました')
        setTimeout(() => setCopied(false), 2000)
    }

    if (isLoading || !token) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
    if (!report) return <div className="p-8 text-center">データが見つかりません</div>

    return (
        <div className="container max-w-3xl py-10 px-4 mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.push('/weeks')} className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> 週報一覧へ戻る
            </Button>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle>週報詳細</CardTitle>
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {report.week_start_date} 〜 {report.week_end_date}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        コピー
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-sm leading-relaxed border font-mono">
                        {report.content}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}