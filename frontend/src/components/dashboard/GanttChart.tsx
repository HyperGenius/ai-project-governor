/* frontend/src/components/dashboard/GanttChart.tsx */
'use client'

import React from 'react'
import { Task } from 'gantt-task-react'
import { Gantt, ViewMode } from 'gantt-task-react'
import "gantt-task-react/dist/index.css"
import { Task as AppTask } from '@/types' // アプリのタスク型

type GanttChartProps = {
    tasks: AppTask[]
    onTaskUpdate: (taskId: string, start: Date, end: Date) => void
}

export function GanttChart({ tasks, onTaskUpdate }: GanttChartProps) {
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Day)

    // アプリのタスクデータをライブラリ用の形式に変換
    const ganttTasks: Task[] = tasks
        // 日付が設定されているタスクのみ表示（またはデフォルト値を設定してもよい）
        .filter(t => t.start_date && t.end_date)
        .map(t => ({
            start: new Date(t.start_date!),
            end: new Date(t.end_date!),
            name: t.title,
            id: t.id,
            type: 'task',
            progress: t.status === 'done' ? 100 : t.status === 'in_progress' ? 50 : 0,
            isDisabled: false,
            styles: {
                progressColor: t.status === 'done' ? '#22c55e' : '#3b82f6',
                progressSelectedColor: '#1d4ed8'
            }
        }))

    const handleTaskChange = (task: Task) => {
        onTaskUpdate(task.id, task.start, task.end)
    }

    if (ganttTasks.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 border border-dashed rounded-lg">
                <p>期間が設定されたタスクがありません。</p>
                <p className="text-sm mt-1">タスクリストから開始日・終了日を設定するとチャートが表示されます。</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* ビューモード切替 */}
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => setViewMode(ViewMode.Day)}
                    className={`px-3 py-1 text-sm rounded ${viewMode === ViewMode.Day ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                >
                    日
                </button>
                <button
                    onClick={() => setViewMode(ViewMode.Week)}
                    className={`px-3 py-1 text-sm rounded ${viewMode === ViewMode.Week ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                >
                    週
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    onDateChange={handleTaskChange} // ドラッグでの期間変更
                    locale="ja"
                    listCellWidth="155px" // タスク名カラムの幅
                    columnWidth={60}
                    barFill={60}
                />
            </div>
        </div>
    )
}