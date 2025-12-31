/* frontend/src/app/reports/new/page.tsx */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/**
 * 新規日報作成ページ
 * @returns 新規日報作成ページ
 */
export default function NewReportPage() {
    const router = useRouter()
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. JWTトークンの取得
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error('認証セッションが見つかりません。ログインしてください。')
            }

            const token = session.access_token

            // 2. バックエンドAPIへの送信
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ここで認証情報を渡す
                },
                body: JSON.stringify({
                    raw_content: content
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || '日報の作成に失敗しました')
            }

            // 3. 成功したらトップページへ戻る
            router.push('/')
            router.refresh() // データを再取得させるためリフレッシュ

        } catch (err: any) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto max-w-2xl py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>日報の作成</CardTitle>
                    <CardDescription>
                        今日の業務内容やトラブルを箇条書きで入力してください。<br />
                        AIが失礼のないビジネスメール形式に変換して登録します。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>エラー</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Textarea
                                placeholder="例：&#13;&#10;- A社の案件、進捗80%。明日完了予定。&#13;&#10;- サーバーが一時停止した。原因調査中。&#13;&#10;- 部長の承認待ちで作業ストップしてます。"
                                className="min-h-[200px] text-base"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                キャンセル
                            </Button>
                            <Button type="submit" disabled={loading || !content.trim()}>
                                {loading ? 'AIが執筆中...' : '日報を作成する'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}