/* frontend/src/components/dashboard/DeleteReportButton.tsx */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { deleteReport } from '@/services/reports'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'

// ... (AlertDialog関連のインポートはそのまま) ...
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type DeleteReportButtonProps = {
    reportId: string
}

export function DeleteReportButton({ reportId }: DeleteReportButtonProps) {
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('認証セッションが切れました')
                return
            }

            const success = await deleteReport(session.access_token, reportId)
            if (!success) {
                throw new Error('削除に失敗しました')
            }

            // 日報一覧のキャッシュを無効化する
            // 全てのキャッシュキーを確認し、APIパスに '/reports' が含まれるものを再取得対象にする
            await mutate(
                (key) => Array.isArray(key) && (key[0] as string).includes('/api/v1/reports'),
                undefined,
                { revalidate: true }
            )

            toast.success('日報を削除しました')
            router.push('/')
            router.refresh()

        } catch (error) {
            toast.error('削除中にエラーが発生しました')
            console.error(error)
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                        この操作は取り消せません。作成した日報データが完全に削除されます。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDeleting(false)}>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? '削除中...' : '削除実行'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}