/* frontend/src/components/auth/SignupForm.tsx */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signUpAction } from '@/app/signup/actions'

/**
 * サインアップフォーム
 * @returns サインアップフォーム
 */
export function SignupForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'create' | 'join'>('create')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            fullName: formData.get('fullName') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            companyName: mode === 'create' ? (formData.get('companyName') as string) : undefined,
            inviteCode: mode === 'join' ? (formData.get('inviteCode') as string) : undefined,
        }

        try {
            const result = await signUpAction(data)
            if (result?.error) {
                setError(result.error)
            }
        } catch (err) {
            setError('予期せぬエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* --- モード切替タブ --- */}
            <div className="flex w-full bg-muted p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => setMode('create')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'create'
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    新規チーム作成
                </button>
                <button
                    type="button"
                    onClick={() => setMode('join')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'join'
                            ? 'bg-background shadow text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    チームに参加
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* 共通フィールド */}
                <div className="space-y-2">
                    <Label htmlFor="fullName">お名前</Label>
                    <Input id="fullName" name="fullName" placeholder="山田 太郎" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input id="password" name="password" type="password" required />
                </div>

                {/* 条件分岐フィールド */}
                {mode === 'create' ? (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="companyName">会社名 / チーム名</Label>
                        <Input id="companyName" name="companyName" placeholder="株式会社〇〇" required />
                    </div>
                ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="inviteCode">招待コード</Label>
                        <Input id="inviteCode" name="inviteCode" placeholder="管理者から共有されたコード" required />
                    </div>
                )}

                <Button type="submit" className="w-full mt-4" disabled={loading}>
                    {loading ? '処理中...' : (mode === 'create' ? 'チームを作成して登録' : 'チームに参加して登録')}
                </Button>
            </form>
        </div>
    )
}