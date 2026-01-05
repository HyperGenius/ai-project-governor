/* frontend/src/components/dashboard/DeleteReportButton.tsx */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { deleteReport } from '@/services/reports'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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

/**
 * 日報削除ボタン
 * @param reportId 日報ID
 * @returns 日報削除ボタン
 */
export function DeleteReportButton({ reportId }: DeleteReportButtonProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    /**
     * 日報削除処理
     * 削除が正常に行われた場合はトップページに戻る
     * エラーが発生した場合はトーストを表示する
     */
    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error('認証セッションが切れました')
                return
            }

            const success = await deleteReport(reportId, session.access_token)
            if (!success) {
                throw new Error('削除に失敗しました')
            }

            toast.success('日報を削除しました')
            router.push('/') // トップへ戻る
            router.refresh() // データの再取得をトリガー

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
