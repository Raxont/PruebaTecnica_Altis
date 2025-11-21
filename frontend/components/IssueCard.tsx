'use client'

import Link from 'next/link'
import { Issue } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface IssueCardProps {
  issue: Issue
}

const priorityConfig = {
  LOW: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  MED: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  HIGH: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

const statusConfig = {
  TODO: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700' },
  DONE: { bg: 'bg-green-100', text: 'text-green-700' },
}

export default function IssueCard({ issue }: IssueCardProps) {
  const priority = priorityConfig[issue.priority]
  const status = statusConfig[issue.status]

  return (
    <Link href={`/dashboard/issue/${issue.id}`}>
      <div className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group animate-fade-in">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {issue.title}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <div className={`w-2 h-2 rounded-full ${priority.dot}`}></div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-md ${priority.bg} ${priority.text}`}>
              {issue.priority}
            </span>
          </div>
        </div>

        {issue.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {issue.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs mb-3">
          <span className={`px-3 py-1.5 rounded-lg font-medium ${status.bg} ${status.text}`}>
            {issue.status.replace('_', ' ')}
          </span>
          {issue.assignee && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {issue.assignee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-medium">{issue.assignee.name}</span>
            </div>
          )}
        </div>

        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {issue.labels.slice(0, 3).map((label, idx) => (
              <span key={idx} className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-2.5 py-1 text-xs rounded-md font-medium border border-gray-200">
                {label}
              </span>
            ))}
            {issue.labels.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{issue.labels.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
          </span>
          {issue._count && issue._count.comments > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              💬 {issue._count.comments}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}