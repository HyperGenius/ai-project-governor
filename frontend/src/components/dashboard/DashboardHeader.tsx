/* frontend/src/components/dashboard/DashboardHeader.tsx */
'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'
import { Copy, Users } from 'lucide-react'
import { toast } from 'sonner'

type DashboardHeaderProps = {
    userEmail: string | undefined
    tenantName?: string
    tenantId?: string
}

/**
 * ダッシュボードのヘッダー
 * @param userEmail ユーザーのメールアドレス
 * @returns ダッシュボードのヘッダー
 */
export function DashboardHeader({ userEmail, tenantName, tenantId }: DashboardHeaderProps) {
    const copyInviteCode = () => {
        if (!tenantId) return
        navigator.clipboard.writeText(tenantId)
        toast.success('招待コードをコピーしました')
    }

    return (
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start bg-white p-6 rounded-lg border shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">日報管理ダッシュボード</h1>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    <p>ユーザー: {userEmail}</p>

                    {tenantName && (
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                            <Users className="h-3 w-3" />
                            <span className="font-medium">{tenantName}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {tenantId && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyInviteCode}
                        className="text-gray-600"
                        title="招待コード（テナントID）をコピー"
                    >
                        <Copy className="mr-2 h-3 w-3" />
                        招待コード
                    </Button>
                )}

                <form action={signOut}>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                        ログアウト
                    </Button>
                </form>
            </div>
        </div>
    )
}