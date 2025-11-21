'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Issue, Activity } from '@/types'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Issue not found</div>
      </div>
    )
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/issue/${issueId}/edit`)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this issue?')) {
                deleteMutation.mutate()
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded ${statusColors[issue.status]}`}>
              {issue.status.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded ${priorityColors[issue.priority]}`}>
              {issue.priority}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>Created by {issue.creator.name}</span>
          {issue.assignee && <span>• Assigned to {issue.assignee.name}</span>}
          <span>• {format(new Date(issue.createdAt), 'MMM d, yyyy')}</span>
        </div>

        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {issue.labels.map((label, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded">
                {label}
              </span>
            ))}
          </div>
        )}

        {issue.description && (
          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <div className="text-gray-700">
              <ReactMarkdown>{issue.description}</ReactMarkdown>
            </div>
          </div>
        )}

        {issue.activities && issue.activities.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity</h3>
            <div className="space-y-2">
              {issue.activities.map((activity) => (
                <div key={activity.id} className="text-sm text-gray-600">
                  <span className="font-medium">{activity.action}</span>
                  {activity.field && (
                    <>
                      {' '}
                      <span className="text-gray-500">
                        {activity.field}: {activity.oldValue} → {activity.newValue}
                      </span>
                    </>
                  )}
                  <span className="text-gray-400 ml-2">
                    {format(new Date(activity.createdAt), 'MMM d, HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <CommentSection issueId={issueId} />
      </div>
    </div>
  )
}