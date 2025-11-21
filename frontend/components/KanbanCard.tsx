'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Issue } from '@/types'
import Link from 'next/link'

interface KanbanCardProps {
  issue: Issue
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MED: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
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
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition"
    >
      <Link href={`/dashboard/issue/${issue.id}`} onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 text-sm flex-1 pr-2">
              {issue.title}
            </h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[issue.priority]}`}>
              {issue.priority}
            </span>
          </div>

          {issue.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {issue.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            {issue.assignee && (
              <span className="text-gray-600">
                👤 {issue.assignee.name}
              </span>
            )}
            {issue._count && issue._count.comments > 0 && (
              <span className="text-gray-500">
                💬 {issue._count.comments}
              </span>
            )}
          </div>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.labels.slice(0, 3).map((label, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded">
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