/* frontend/src/components/dashboard/ProjectList.tsx */
'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, FolderKanban, Loader2 } from 'lucide-react'
import { Project } from '@/types'

type ProjectListProps = {
    accessToken: string
}

export function ProjectList({ accessToken }: ProjectListProps) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const { data: projects, isLoading } = useSWR<Project[]>(
        [`${API_BASE_URL}/api/v1/projects`, accessToken],
        fetcher
    )

    if (isLoading) {
        return (
            <div className="flex justify-center py-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                読み込み中...
            </div>
        )
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">進行中のプロジェクト</h2>
                <Link href="/projects/new">
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> 新規プロジェクト
                    </Button>
                </Link>
            </div>

            {!projects || projects.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500 mb-2">まだプロジェクトがありません。</p>
                    <Link href="/projects/new">
                        <Button variant="outline">最初のプロジェクトを作成</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {projects.map((project) => {
                        // 進捗率の計算
                        const totalTasks = project.tasks.length
                        const completedTasks = project.tasks.filter(t => t.status === 'done').length
                        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                        return (
                            <Card key={project.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <FolderKanban className="h-5 w-5 text-blue-600" />
                                            <CardTitle className="text-lg">{project.name}</CardTitle>
                                        </div>
                                        <Badge variant={project.status === 'planning' ? 'secondary' : 'default'}>
                                            {project.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {project.description}
                                    </p>

                                    {/* 進捗バー */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>進捗: {progress}%</span>
                                            <span>{completedTasks} / {totalTasks} タスク</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 text-xs text-gray-400 text-right">
                                        期限: {project.end_date || '未定'}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}