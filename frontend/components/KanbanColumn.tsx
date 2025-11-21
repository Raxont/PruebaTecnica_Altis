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

const statusConfig = {
  TODO: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-200',
    header: 'bg-blue-600',
    icon: '📝',
  },
  IN_PROGRESS: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-200',
    header: 'bg-purple-600',
    icon: '⚡',
  },
  DONE: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    header: 'bg-green-600',
    icon: '✅',
  },
}

export default function KanbanColumn({ title, status, issues, count }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const config = statusConfig[status]

  return (
    <div className={`flex-1 min-w-[320px] ${config.bg} rounded-xl border-2 ${config.border} transition-all duration-200 ${isOver ? 'shadow-lg scale-[1.02]' : 'shadow-sm'}`}>
      <div className={`${config.header} text-white px-4 py-3 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
            {count}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`p-4 space-y-3 min-h-[600px] transition-colors duration-200 ${isOver ? 'bg-white/50' : ''}`}
      >
        <SortableContext
          items={issues.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-5xl mb-2">{config.icon}</div>
              <p className="text-sm font-medium">No issues here</p>
            </div>
          ) : (
            issues.map((issue) => (
              <KanbanCard key={issue.id} issue={issue} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}