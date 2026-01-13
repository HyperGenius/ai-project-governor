/* frontend/src/app/settings/page.tsx */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getAISettings, updateAISettings, AISettings } from '@/services/profiles'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

// トーン設定のオプション
const TONE_OPTIONS = [
    {
        value: 'professional',
        label: 'プロフェッショナル（標準）',
        description: '丁寧な「です・ます」調で、ビジネスマナーに則った日報'
    },
    {
        value: 'concise',
        label: '簡潔・社内向け',
        description: '事実のみを短く伝える「だ・である」調または箇条書き'
    },
    {
        value: 'english',
        label: '英語（English）',
        description: 'Professional English business report style'
    },
    {
        value: 'enthusiastic',
        label: '熱血営業マン',
        description: '前向きで熱意のある表現で、成果を強調'
    },
]

/**
 * AI設定ページ
 * @returns AI設定ページ
 */
export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<AISettings>({
        tone: 'professional',
        language: 'ja',
        custom_instructions: '',
    })

    // 初期化時にAI設定を取得
    useEffect(() => {
        const init = async () => {
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    router.push('/login')
                    return
                }

                const aiSettings = await getAISettings(session.access_token)
                setSettings(aiSettings)
            } catch (error) {
                console.error('AI設定の取得に失敗:', error)
                toast.error('AI設定の読み込みに失敗しました')
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [router])

    const handleSave = async () => {
        setSaving(true)
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/login')
                return
            }

            await updateAISettings(session.access_token, settings)
            toast.success('AI設定を保存しました！')
        } catch (error) {
            console.error('AI設定の保存に失敗:', error)
            toast.error('AI設定の保存に失敗しました')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="container max-w-2xl py-10 px-4 mx-auto flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    // 選択されたトーンの説明を取得
    const selectedToneOption = TONE_OPTIONS.find(opt => opt.value === settings.tone)

    return (
        <div className="container max-w-2xl py-10 px-4 mx-auto">
            <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>AI人格・口調の設定</CardTitle>
                    <CardDescription>
                        日報を清書するAIの人格と口調をカスタマイズできます。
                        設定はすべての日報作成に適用されます。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* トーン選択 */}
                    <div className="space-y-2">
                        <Label htmlFor="tone">トーン・スタイル</Label>
                        <Select
                            value={settings.tone}
                            onValueChange={(value) =>
                                setSettings({ ...settings, tone: value as AISettings['tone'] })
                            }
                        >
                            <SelectTrigger id="tone">
                                <SelectValue placeholder="トーンを選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {TONE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedToneOption && (
                            <p className="text-sm text-muted-foreground">
                                {selectedToneOption.description}
                            </p>
                        )}
                    </div>

                    {/* 言語選択 */}
                    <div className="space-y-2">
                        <Label htmlFor="language">言語</Label>
                        <Select
                            value={settings.language}
                            onValueChange={(value) =>
                                setSettings({ ...settings, language: value as AISettings['language'] })
                            }
                        >
                            <SelectTrigger id="language">
                                <SelectValue placeholder="言語を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ja">日本語</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* カスタム指示 */}
                    <div className="space-y-2">
                        <Label htmlFor="custom_instructions">カスタム指示（任意）</Label>
                        <Textarea
                            id="custom_instructions"
                            placeholder="AIへの追加指示を自由に記述してください（例：専門用語を使う、カジュアルな表現を避ける、など）"
                            value={settings.custom_instructions}
                            onChange={(e) =>
                                setSettings({ ...settings, custom_instructions: e.target.value })
                            }
                            rows={4}
                        />
                        <p className="text-sm text-muted-foreground">
                            選択したトーンに加えて、さらに細かい指示を追加できます。
                        </p>
                    </div>

                    {/* 保存ボタン */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            size="lg"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    設定を保存
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 説明カード */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">💡 設定のヒント</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>
                        <strong>プロフェッショナル：</strong> JTC企業向けの丁寧な日報。上司への報告に最適。
                    </p>
                    <p>
                        <strong>簡潔：</strong> 社内向けの短い報告。技術チームやアジャイル開発に向いています。
                    </p>
                    <p>
                        <strong>英語：</strong> 外資系企業や国際チーム向け。英語で日報を作成します。
                    </p>
                    <p>
                        <strong>熱血営業マン：</strong> ポジティブで前向きな表現。営業やマーケティングチームに。
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
