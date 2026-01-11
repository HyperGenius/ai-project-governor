/* frontend/src/app/page.tsx */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import Link from 'next/link'
// コンポーネント
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ReportActionArea } from '@/components/dashboard/ReportActionArea'
import { ReportList } from '@/components/dashboard/ReportList'
import { ProjectList } from '@/components/dashboard/ProjectList'
import { Button } from '@/components/ui/button'

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 日報作成 */}
          <ReportActionArea />

          {/* 週報作成 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">週報管理</h2>
              <p className="text-sm text-gray-500">1週間分の日報を集約します。</p>
            </div>
            <Link href="/weeks">
              <Button variant="outline" size="lg" className="shadow-sm">
                <FileText className="mr-2 h-4 w-4" /> 週報を見る
              </Button>
            </Link>
          </div>
        </div>

        {/* プロジェクト一覧エリア */}
        <ProjectList accessToken={session.access_token} />

        {/* 日報リストエリア */}
        <ReportList accessToken={session.access_token} />

      </div>
    </div>
  )
}