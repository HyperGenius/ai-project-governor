/* frontend/src/app/reports/id/page.tsx */
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft } from 'lucide-react'
import { getReportById } from '@/services/reports'
import { ReportCopySection } from '@/components/dashboard/ReportCopySection'
import { DeleteReportButton } from '@/components/dashboard/DeleteReportButton'

type ReportDetailPageProps = {
    params: Promise<{ id: string }>
}

/**
 * 日報詳細ページ
 * @param params パラメータ
 * @returns 日報詳細ページ
 */
export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) redirect('/login')

    // パラメータを取得
    const { id } = await params

    // データを取得
    const report = await getReportById(id, session.access_token)

    // データが存在しない、または権限がない場合
    if (!report) {
        notFound() // 404ページを表示
    }

    return (
        <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
            <div className="w-full max-w-3xl space-y-6">
                {/* ヘッダーナビゲーション */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                        {report.subject || '日報詳細'}
                    </h1>
                </div>

                {/* メタ情報 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 px-2">
                    <p>{new Date(report.created_at).toLocaleString('ja-JP')}</p>
                    <Badge variant="outline">
                        丁寧度 Lv.{report.politeness_level}
                    </Badge>
                </div>

                {/* 生成された日報（コピー機能付き） */}
                <ReportCopySection
                    title="生成された日報"
                    content={report.content_polished}
                />

                {/* 元のメモ（参考用） */}
                <div className="mt-8 pt-8 border-t">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">元の箇条書きメモ</h3>
                    <div className="bg-white p-4 rounded-md border whitespace-pre-wrap text-gray-600 text-sm">
                        {report.content_raw}
                    </div>
                </div>

                {/* 削除ボタン */}
                <div className="flex justify-end">
                    <DeleteReportButton reportId={report.id} />
                </div>
            </div>
        </div>
    )
}