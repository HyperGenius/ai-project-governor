/* frontend/src/components/dashboard/DashboardHeader.tsx */

import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'

type Props = {
    userEmail: string | undefined
}

/**
 * ダッシュボードのヘッダー
 * @param userEmail ユーザーのメールアドレス
 * @returns ダッシュボードのヘッダー
 */
export function DashboardHeader({ userEmail }: Props) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">日報管理ダッシュボード</h1>
                <p className="text-gray-500 mt-1">ログイン中: {userEmail}</p>
            </div>
            <form action={signOut}>
                <Button variant="outline" size="sm">ログアウト</Button>
            </form>
        </div>
    )
}