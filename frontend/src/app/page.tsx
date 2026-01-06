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

  // 2. 並行リクエストで「日報一覧」と「プロフィール(テナント情報含む)」を取得
  const [reports, profileRes] = await Promise.all([
    getReports(session.access_token),
    supabase
      .from('profiles')
      .select('*, tenants(id, name)') // 紐付いているtenantsテーブルの情報も取得
      .eq('id', session.user.id)
      .single()
  ])

  // 3. テナント情報の取り出し（型安全性のため少しチェック）
  const tenant = profileRes.data?.tenants as unknown as { id: string; name: string } | null

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl space-y-8">

        {/* ヘッダーエリア */}
        <DashboardHeader
          userEmail={session.user.email}
          tenantName={tenant?.name}
          tenantId={tenant?.id}
        />

        {/* アクションエリア */}
        <ReportActionArea />

        {/* リストエリア */}
        <ReportList reports={reports} />

      </div>
    </div>
  )
}