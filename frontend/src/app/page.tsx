/* frontend/src/app/page.tsx */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// コンポーネント
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ReportActionArea } from '@/components/dashboard/ReportActionArea'
import { ReportList } from '@/components/dashboard/ReportList'
// API
import { getReports } from '@/services/reports'

/**
 * メインページ
 * @returns メインページ
 */
export default async function Home() {
  const supabase = await createClient()

  // 1. セッションとトークンの取得
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // 2. バックエンドAPIから日報一覧を取得
  const reports = await getReports(session.access_token)

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl space-y-8">

        {/* ヘッダーエリア */}
        <DashboardHeader userEmail={session.user.email} />

        {/* アクションエリア */}
        <ReportActionArea />

        {/* リストエリア */}
        <ReportList reports={reports} />

      </div>
    </div>
  )
}