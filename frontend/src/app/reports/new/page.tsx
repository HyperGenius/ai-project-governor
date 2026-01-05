/* frontend/src/app/reports/new/page.tsx */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// 丁寧度の説明マップ
const LEVEL_DESCRIPTIONS: Record<number, string> = {
    1: 'Lv.1 【簡潔・社内向け】 事実のみを伝える、非常に短い文章。',
    2: 'Lv.2 【普通・同僚向け】 「です・ます」調の標準的な日報。',
    3: 'Lv.3 【丁寧・上司向け】 失礼のない、しっかりとしたビジネス文書。',
    4: 'Lv.4 【高尚・役員向け】 謙譲語・尊敬語を用いた格調高い文章。',
    5: 'Lv.5 【謝罪・緊急時】 深い反省や配慮を示す、最大限に慎重な表現。',
}

/**
 * 新規日報作成ページ
 * @returns 新規日報作成ページ
 */
export default function NewReportPage() {
    const router = useRouter()
    const [content, setContent] = useState('')
    const [politenessLevel, setPolitenessLevel] = useState(3)
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
                    raw_content: content,
                    politeness_level: politenessLevel
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
                        {/* --- 丁寧度スライダー --- */}
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-bold">丁寧さレベル: {politenessLevel}</Label>
                            </div>

                            <Slider
                                defaultValue={[3]}
                                max={5}
                                min={1}
                                step={1}
                                value={[politenessLevel]}
                                onValueChange={(vals) => setPolitenessLevel(vals[0])}
                                className="py-4"
                            />

                            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md text-sm font-medium">
                                {LEVEL_DESCRIPTIONS[politenessLevel]}
                            </div>
                        </div>

                        {/* --- 本文入力 --- */}
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