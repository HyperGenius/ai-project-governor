/* frontend/src/components/dashboard/ReportList.tsx */
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Report } from '@/types' // Step 1で作った型

type ReportListProps = {
    reports: Report[]
}

/**
 * レポート一覧
 * @param reports レポート一覧
 * @returns レポート一覧
 */
export function ReportList({ reports }: ReportListProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">過去の日報一覧</h2>

            {reports.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">
                    まだ日報がありません。上のボタンから作成してみましょう！
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <Link href={`/reports/${report.id}`} key={report.id}>
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">
                                                {report.subject || '（件名なし）'}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500">
                                                {new Date(report.created_at).toLocaleString('ja-JP')}
                                            </p>
                                        </div>
                                        <Badge variant={report.politeness_level >= 5 ? "default" : "secondary"}>
                                            丁寧度 Lv.{report.politeness_level}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {report.content_polished || '（生成中の可能性があります）'}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}