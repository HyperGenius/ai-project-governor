/* frontend/src/app/page.tsx */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// コンポーネント
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ReportActionArea } from '@/components/dashboard/ReportActionArea'
import { ReportList } from '@/components/dashboard/ReportList'

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

  // 2. プロフィール(テナント情報含む)のみ取得
  // ※日報一覧取得(getReports)は削除し、ReportList内でSWRにより非同期取得させる
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(id, name)')
    .eq('id', session.user.id)
    .single()

  // 3. テナント情報の取り出し（型安全性のため少しチェック）
  const tenant = profile?.tenants as unknown as { id: string; name: string } | null

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

        {/* リストエリア (アクセストークンを渡す) */}
        <ReportList accessToken={session.access_token} />

      </div>
    </div>
  )
}