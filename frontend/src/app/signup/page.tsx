/* frontend/src/app/signup/page.tsx */
'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { SignupForm } from '@/components/auth/SignupForm'

/**
 * サインアップページ
 * @returns サインアップページ
 */
export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">

                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">アカウント作成</CardTitle>
                    <CardDescription className="text-center">
                        チームを作成、または既存チームに参加して<br />AI日報管理を始めましょう
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* フォームロジックは分離されたコンポーネントへ */}
                    <SignupForm />
                </CardContent>

                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-500">
                        すでにアカウントをお持ちですか？{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            ログイン
                        </Link>
                    </p>
                </CardFooter>

            </Card>
        </div>
    )
}