/* frontend/src/components/dashboard/ReportActionArea.tsx */
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * レポートアクションエリア
 * @returns レポートアクションエリア
 */
export function ReportActionArea() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold">新規日報作成</h2>
                <p className="text-sm text-gray-500">箇条書きのメモからAIが日報を生成します。</p>
            </div>
            <Link href="/reports/new">
                <Button size="lg" className="shadow-md">
                    📝 日報を作成する
                </Button>
            </Link>
        </div>
    )
}

