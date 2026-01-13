/* frontend/src/components/projects/ScopingChat.tsx */
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage, ProjectData } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { scopingChat } from '@/services/projects'
import { createClient } from '@/utils/supabase/client'

// WBS生成完了後の遷移ディレイ（ユーザーが完了メッセージを確認できるように）
const COMPLETION_TRANSITION_DELAY_MS = 1000

type ScopingChatProps = {
    initialDescription: string
    onComplete: (projectData: ProjectData) => void
    onCancel: () => void
}

export default function ScopingChat({ initialDescription, onComplete, onCancel }: ScopingChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'user', content: initialDescription }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // WBSデータを親コンポーネントに渡すヘルパー
    const completeScoping = (wbsData: NonNullable<ScopingChatResponse['wbs_data']>) => {
        setIsComplete(true)
        toast.success('要件定義が完了しました！WBSを生成します。')
        setTimeout(() => {
            onComplete({
                name: wbsData.name,
                description: wbsData.description,
                start_date: wbsData.start_date,
                end_date: wbsData.end_date,
                milestones: wbsData.milestones || '',
                tasks: wbsData.tasks
            })
        }, COMPLETION_TRANSITION_DELAY_MS)
    }

    // メッセージを送信する
    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage: ChatMessage = { role: 'user', content: input.trim() }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('認証が必要です')
                return
            }

            const response = await scopingChat(session.access_token, newMessages)

            // AIの応答をメッセージに追加
            const aiMessage: ChatMessage = { role: 'assistant', content: response.message }
            setMessages([...newMessages, aiMessage])

            // ヒアリングが完了した場合
            if (response.is_complete && response.wbs_data) {
                completeScoping(response.wbs_data)
            }
        } catch (e) {
            toast.error('エラーが発生しました')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // 最初のメッセージを送信（初期化時）
    useEffect(() => {
        if (messages.length === 1) {
            handleInitialMessage()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleInitialMessage = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await scopingChat(session.access_token, messages)
            const aiMessage: ChatMessage = { role: 'assistant', content: response.message }
            setMessages([...messages, aiMessage])

            if (response.is_complete && response.wbs_data) {
                completeScoping(response.wbs_data)
            }
        } catch (e) {
            toast.error('エラーが発生しました')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Enterキーで送信
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="container max-w-4xl py-10 px-4 mx-auto">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold">AIとの対話でプロジェクトを明確化</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        AIがあなたのプロジェクトについて質問します。回答を重ねることで、より精度の高いタスクリストを生成できます。
                    </p>

                    {/* チャットメッセージ表示エリア */}
                    <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto bg-gray-50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        msg.role === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 入力エリア */}
                    {!isComplete && (
                        <div className="flex gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="回答を入力してください... (Shift+Enterで改行)"
                                className="flex-1 min-h-[80px]"
                                disabled={loading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                size="lg"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    )}

                    {isComplete && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <p className="text-green-700 font-bold">✅ 要件定義が完了しました！</p>
                            <p className="text-sm text-gray-600 mt-1">タスクリストを生成しています...</p>
                        </div>
                    )}

                    {/* キャンセルボタン */}
                    <div className="mt-4 text-center">
                        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
                            キャンセル
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
