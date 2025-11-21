'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Issue, Activity } from '@/types'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import CommentSection from '@/components/CommentSection'

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const issueId = parseInt(params.id as string)

  const { data: issue, isLoading } = useQuery<Issue & { activities: Activity[] }>({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const { data } = await api.get(`/issues/${issueId}`)
      return data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/issues/${issueId}`)
    },
    onSuccess: () => {
      router.push('/dashboard')
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading issue...</p>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Issue not found</h3>
        <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">
          Back to Issues
        </button>
      </div>
    )
  }

  const priorityConfig = {
    LOW: { bg: 'bg-gray-100', text: 'text-gray-700', icon: '🔵' },
    MED: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🟡' },
    HIGH: { bg: 'bg-red-100', text: 'text-red-700', icon: '🔴' },
  }

  const statusConfig = {
    TODO: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📝' },
    IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '⚡' },
    DONE: { bg: 'bg-green-100', text: 'text-green-700', icon: '✅' },
  }

  const priority = priorityConfig[issue.priority]
  const status = statusConfig[issue.status]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/dashboard/issue/${issueId}/edit`)}
            className="btn-secondary"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this issue?')) {
                deleteMutation.mutate()
              }
            }}
            className="btn-danger"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Tarjeta principal del issue */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6 animate-fade-in">
        {/* Título y badges */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 flex-1">{issue.title}</h1>
          <div className="flex flex-wrap gap-2">
            <span className={`px-4 py-2 text-sm font-bold rounded-lg ${status.bg} ${status.text} flex items-center gap-2`}>
              {status.icon} {issue.status.replace('_', ' ')}
            </span>
            <span className={`px-4 py-2 text-sm font-bold rounded-lg ${priority.bg} ${priority.text} flex items-center gap-2`}>
              {priority.icon} {issue.priority}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Created by</span>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {issue.creator.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{issue.creator.name}</span>
            </div>
          </div>
          {issue.assignee && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Assigned to</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {issue.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{issue.assignee.name}</span>
                </div>
              </div>
            </>
          )}
          <span className="text-gray-400">•</span>
          <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
        </div>

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 py-6 border-b border-gray-200">
            {issue.labels.map((label, idx) => (
              <span key={idx} className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-3 py-1.5 text-sm rounded-lg font-medium border border-gray-200">
                🏷️ {label}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {issue.description && (
          <div className="py-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📄 Description
            </h3>
            <div className="prose max-w-none text-gray-700">
              <ReactMarkdown>{issue.description}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Activity */}
        {issue.activities && issue.activities.length > 0 && (
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📊 Activity
              <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {issue.activities.length}
              </span>
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {issue.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold capitalize">{activity.action}</span>
                      {activity.field && (
                        <span className="text-gray-600">
                          {' '}{activity.field}
                          {activity.oldValue && activity.newValue && (
                            <>
                              {' from '}
                              <span className="font-medium text-red-600">{activity.oldValue}</span>
                              {' to '}
                              <span className="font-medium text-green-600">{activity.newValue}</span>
                            </>
                          )}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sección de comentarios */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-fade-in">
        <CommentSection issueId={issueId} />
      </div>
    </div>
  )
}