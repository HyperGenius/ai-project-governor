/* src/app/page.tsx */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * メインページ
 * @returns メインページ
 */
export default async function Home() {
  const supabase = await createClient()

  // ユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()

  // 万が一ミドルウェアをすり抜けても、ここで弾く（二重チェック）
  if (!user) {
    redirect('/login')
  }

  // ログアウト処理 (Server Action)
  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">日報管理システム</h1>

        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="mb-4 text-lg">ようこそ、ログインしました！</p>
          <p className="mb-6 font-bold text-blue-600">{user.email}</p>

          <div>
            <Link href="/reports/new">
              <Button className="w-full text-lg py-6">
                📝 日報を作成する
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <form action={signOut}>
              <Button variant="ghost" className="text-gray-500">ログアウト</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}