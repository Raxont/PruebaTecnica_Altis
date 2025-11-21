'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Issue } from '@/types'
import Link from 'next/link'

interface KanbanCardProps {
  issue: Issue
}

const priorityConfig = {
  LOW: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  MED: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  HIGH: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

export default function KanbanCard({ issue }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const priority = priorityConfig[issue.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-lg border-2 border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all duration-200 ${isDragging ? 'shadow-2xl rotate-2' : ''}`}
    >
      <Link 
        href={`/dashboard/issue/${issue.id}`} 
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="block"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-2 hover:text-blue-600 transition-colors">
              {issue.title}
            </h4>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${priority.dot}`}></div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${priority.bg} ${priority.text}`}>
                {issue.priority}
              </span>
            </div>
          </div>

          {issue.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {issue.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            {issue.assignee && (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {issue.assignee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-700 font-medium">{issue.assignee.name}</span>
              </div>
            )}
            {issue._count && issue._count.comments > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                💬 {issue._count.comments}
              </span>
            )}
          </div>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.labels.slice(0, 3).map((label, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded border border-gray-200 font-medium">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}