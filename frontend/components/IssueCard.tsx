'use client'

import Link from 'next/link'
import { Issue } from '@/types'

interface IssueCardProps {
  issue: Issue
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MED: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
}

const statusColors = {
  TODO: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  DONE: 'bg-green-100 text-green-800',
}

export default function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link href={`/dashboard/issue/${issue.id}`}>
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1">{issue.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[issue.priority]}`}>
            {issue.priority}
          </span>
        </div>

        {issue.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {issue.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded ${statusColors[issue.status]}`}>
              {issue.status.replace('_', ' ')}
            </span>
            {issue.assignee && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                👤 {issue.assignee.name}
              </span>
            )}
          </div>
          {issue._count && (
            <span>💬 {issue._count.comments}</span>
          )}
        </div>

        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {issue.labels.map((label, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs rounded">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}