/* frontend/src/app/reports/id/page.tsx */
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getReportById } from '@/services/reports'
import { ReportDetailView } from '@/components/dashboard/ReportDetailView'

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

    // クライアントコンポーネントにデータとトークンを渡す
    return (
        <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
            <ReportDetailView report={report} accessToken={session.access_token} />
        </div>
    )
}