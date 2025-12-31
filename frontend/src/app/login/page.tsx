/* src/app/login/actions.ts */
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * ログインページ
 * @returns ログインページ
 */
export default function LoginPage() {
    // 環境変数を取得（設定がない場合は空文字にする）
    const isDev = process.env.NODE_ENV === 'development'
    const defaultEmail = isDev ? process.env.TEST_EMAIL : ''
    const defaultPassword = isDev ? process.env.TEST_PASSWORD : ''
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">ログイン</CardTitle>
                    <CardDescription>
                        アカウント情報を入力してログインしてください
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={login} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                defaultValue={defaultEmail} // テスト用に初期入力
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">パスワード</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                defaultValue={defaultPassword} // テスト用に初期入力
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            ログイン
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}