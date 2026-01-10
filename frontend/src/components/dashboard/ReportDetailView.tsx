/* frontend/src/components/dashboard/ReportDetailView.tsx */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Report } from '@/types'
import { updateReport } from '@/services/reports'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ChevronLeft, Pencil, Save, X } from 'lucide-react'

// Existing Components
import { ReportCopySection } from '@/components/dashboard/ReportCopySection'
import { DeleteReportButton } from '@/components/dashboard/DeleteReportButton'

// --- Custom Hook: 編集ロジックの分離 ---
function useReportEditor(report: Report, accessToken: string) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // 編集用フォームの状態
    const [formData, setFormData] = useState({
        subject: report.subject || '',
        content: report.content_polished || ''
    })

    const handleChange = (key: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const startEditing = () => setIsEditing(true)

    const cancelEditing = () => {
        setFormData({
            subject: report.subject || '',
            content: report.content_polished || ''
        })
        setIsEditing(false)
    }

    const saveReport = async () => {
        setLoading(true)
        try {
            const updated = await updateReport(report.id, accessToken, {
                subject: formData.subject,
                content_polished: formData.content
            })

            if (!updated) throw new Error('更新に失敗しました')

            toast.success('日報を更新しました')
            setIsEditing(false)
            router.refresh()
        } catch (err) {
            toast.error('エラーが発生しました')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return {
        isEditing,
        loading,
        formData,
        handleChange,
        startEditing,
        cancelEditing,
        saveReport
    }
}

type ReportDetailViewProps = {
    report: Report
    accessToken: string
}

/**
 * 日報詳細表示コンポーネント
 */
export function ReportDetailView({ report, accessToken }: ReportDetailViewProps) {
    // ロジックをフックから呼び出し
    const {
        isEditing,
        loading,
        formData,
        handleChange,
        startEditing,
        cancelEditing,
        saveReport
    } = useReportEditor(report, accessToken)

    return (
        <div className="w-full max-w-3xl space-y-6">
            {/* --- ヘッダーエリア --- */}
            <div className="flex items-center w-full min-h-[40px]">
                <div className="flex items-center gap-4 overflow-hidden flex-1">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>

                    {/* タイトル表示/編集 */}
                    {isEditing ? (
                        <Input
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            className="font-bold text-lg h-10"
                            placeholder="件名を入力"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold text-gray-900 truncate">
                            {report.subject || '（件名なし）'}
                        </h1>
                    )}
                </div>

                {/* アクションボタン */}
                <div className="ml-4 shrink-0 flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={loading}>
                                <X className="mr-2 h-4 w-4" /> キャンセル
                            </Button>
                            <Button size="sm" onClick={saveReport} disabled={loading}>
                                <Save className="mr-2 h-4 w-4" /> 保存
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="icon" onClick={startEditing}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <DeleteReportButton reportId={report.id} />
                        </>
                    )}
                </div>
            </div>

            {/* --- メタ情報 (閲覧時のみ) --- */}
            {!isEditing && (
                <div className="flex items-center gap-4 text-sm text-gray-500 px-2">
                    <p>{new Date(report.created_at).toLocaleString('ja-JP')}</p>
                    <Badge variant="outline">丁寧度 Lv.{report.politeness_level}</Badge>
                </div>
            )}

            {/* --- 本文エリア --- */}
            {isEditing ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-gray-500">本文の編集</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.content}
                            onChange={(e) => handleChange('content', e.target.value)}
                            className="min-h-[300px] text-base leading-relaxed p-4"
                        />
                    </CardContent>
                </Card>
            ) : (
                <ReportCopySection title="生成された日報" content={report.content_polished} />
            )}

            {/* --- 元のメモ（常に表示） --- */}
            <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-bold text-gray-700 mb-2">元の箇条書きメモ</h3>
                <div className="bg-white p-4 rounded-md border whitespace-pre-wrap text-gray-600 text-sm">
                    {report.content_raw || '（データなし）'}
                </div>
            </div>
        </div>
    )
}