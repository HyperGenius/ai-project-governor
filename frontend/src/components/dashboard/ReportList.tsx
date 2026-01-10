/* frontend/src/components/dashboard/ReportList.tsx */
'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Report } from '@/types'
import { Loader2, AlertCircle } from 'lucide-react'

type ReportListProps = {
    accessToken: string
}

/**
 * レポート一覧 (SWRによるクライアントサイド取得)
 * @param accessToken APIアクセストークン
 */
export function ReportList({ accessToken }: ReportListProps) {
    // 環境変数からAPIのURLを取得
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // SWRによるデータ取得
    // キーを配列 [url, token] にすることで、トークンが変われば再取得される
    const { data: reports, error, isLoading } = useSWR<Report[]>(
        [`${API_BASE_URL}/api/v1/reports`, accessToken],
        fetcher,
        {
            // オプション設定
            revalidateOnFocus: false, // ウィンドウフォーカス時の再取得を無効化（通信削減）
            dedupingInterval: 60000,  // 1分間はキャッシュを使用
        }
    )

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>日報データを読み込んでいます...</p>
                <p className="text-xs text-gray-400">※サーバー起動中のため時間がかかる場合があります</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-md border border-red-100">
                <AlertCircle className="h-5 w-5" />
                <p>日報の取得に失敗しました。</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">過去の日報一覧</h2>

            {!reports || reports.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">
                    まだ日報がありません。上のボタンから作成してみましょう！
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <Link href={`/reports/${report.id}`} key={report.id}>
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">
                                                {report.subject || '（件名なし）'}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500">
                                                {new Date(report.created_at).toLocaleString('ja-JP')}
                                            </p>
                                        </div>
                                        <Badge variant={report.politeness_level >= 5 ? "default" : "secondary"}>
                                            丁寧度 Lv.{report.politeness_level}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {report.content_polished || '（生成中の可能性があります）'}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}