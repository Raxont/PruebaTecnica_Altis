'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Issue } from '@/types'
import KanbanCard from './KanbanCard'

interface KanbanColumnProps {
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  issues: Issue[]
  count: number
}

const statusColors = {
  TODO: 'bg-blue-50 border-blue-200',
  IN_PROGRESS: 'bg-purple-50 border-purple-200',
  DONE: 'bg-green-50 border-green-200',
}

export default function KanbanColumn({ title, status, issues, count }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  })

  return (
    <div className={`flex-1 min-w-[300px] ${statusColors[status]} rounded-lg border-2 p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-white px-2 py-1 rounded text-sm text-gray-600">
          {count}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[500px]"
      >
        <SortableContext
          items={issues.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <KanbanCard key={issue.id} issue={issue} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}