/* frontend/src/app/weeks/page.tsx */
'use client'

import React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { fetcher } from '@/utils/fetcher'
import { WeeklyReport } from '@/types'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, FileText, ArrowLeft } from 'lucide-react'

export default function WeeklyReportListPage() {
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
    const { data: reports, isLoading } = useSWR<WeeklyReport[]>(
        token ? [`${API_BASE}/api/v1/weeks`, token] : null,
        fetcher
    )

    return (
        <div className="container max-w-3xl py-10 px-4 mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">週報一覧</h1>
                </div>
                <Link href="/weeks/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> 新規作成
                    </Button>
                </Link>
            </div>

            {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>}

            <div className="grid gap-4">
                {reports?.length === 0 && (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded border border-dashed">
                        まだ週報がありません
                    </div>
                )}

                {reports?.map(report => (
                    <Link href={`/weeks/${report.id}`} key={report.id}>
                        <Card className="hover:shadow transition-shadow cursor-pointer">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">
                                            {report.week_start_date} 〜 {report.week_end_date} の週報
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            作成日: {new Date(report.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}