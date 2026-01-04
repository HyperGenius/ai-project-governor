/* frontend/src/components/dashboard/ReportCopySection.tsx */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Copy, Check } from 'lucide-react'

type ReportCopySectionProps = {
    title: string
    content: string | null
}

/**
 * 日報の内容をコピーするセクション
 * @param title タイトル
 * @param content コンテンツ
 * @returns 日報の内容をコピーするセクション
 */
export function ReportCopySection({ title, content }: ReportCopySectionProps) {
    const [copied, setCopied] = useState(false)
    const textToCopy = content || ''

    const handleCopy = async () => {
        if (!textToCopy) return

        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            toast.success('クリップボードにコピーしました')

            // 2秒後にアイコンを戻す
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error('コピーに失敗しました')
        }
    }

    return (
        <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!textToCopy}
                    className="h-8 w-8"
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-gray-800">
                    {textToCopy || <span className="text-gray-400">（データなし）</span>}
                </div>
            </CardContent>
        </Card>
    )
}

