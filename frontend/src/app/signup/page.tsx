/* frontend/src/app/signup/page.tsx */
'use client'

import Link from 'next/link'
import { signUpAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await signUpAction(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('アカウントを作成しました')
            }
        } catch (e) {
            toast.error('予期せぬエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">アカウント作成</CardTitle>
                    <CardDescription className="text-center">
                        チームを作成して、AI日報管理を始めましょう
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">パスワード</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="8文字以上の英数字"
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="space-y-2 pt-2 border-t">
                            <Label htmlFor="companyName">チーム名 / 会社名</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                type="text"
                                placeholder="株式会社〇〇, 開発チームA など"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                これがあなたのテナント（ワークスペース）になります。
                            </p>
                        </div>

                        <Button type="submit" className="w-full mt-4" disabled={loading}>
                            {loading ? '作成中...' : 'アカウントとチームを作成'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        すでにアカウントをお持ちですか？{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            ログイン
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}