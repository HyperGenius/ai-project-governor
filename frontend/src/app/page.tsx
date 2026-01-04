import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// APIレスポンスの型定義
type Report = {
  id: string
  subject: string | null
  content_polished: string | null
  politeness_level: number
  report_date: string
  created_at: string
}

/**
 * APIから日報一覧を取得する
 * @param accessToken API認証用のアクセストークン
 * @returns 日報一覧
 */
async function getReports(accessToken: string): Promise<Report[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // 常に最新データを取得（キャッシュしない）
    cache: 'no-store',
  })

  if (!res.ok) {
    // APIエラー時は空配列を返すかエラーを投げる
    console.error('Failed to fetch reports')
    return []
  }

  return res.json()
}

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

  // 3. ログアウト用アクション
  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl space-y-8">

        {/* ヘッダーエリア */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">日報管理ダッシュボード</h1>
            <p className="text-gray-500 mt-1">ログイン中: {session.user.email}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm">ログアウト</Button>
          </form>
        </div>

        {/* アクションエリア */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">新規日報作成</h2>
            <p className="text-sm text-gray-500">箇条書きのメモからAIが日報を生成します。</p>
          </div>
          <Link href="/reports/new">
            <Button size="lg" className="shadow-md">
              📝 日報を作成する
            </Button>
          </Link>
        </div>

        {/* リストエリア */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">過去の日報一覧</h2>

          {reports.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">
              まだ日報がありません。上のボタンから作成してみましょう！
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
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
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}