'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { User } from '@/types'

export default function NewIssuePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MED',
    assigneeId: '',
    labels: '',
  })
  const [error, setError] = useState('')

  const { data: usersData } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return [data]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/issues', data)
    },
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error creating issue')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const labels = formData.labels
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l)

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : undefined,
      labels,
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors mb-4"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Issue</h1>
        <p className="text-gray-600">Fill in the details to create a new issue</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="Brief description of the issue"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
            Description
            <span className="text-gray-500 font-normal ml-2">(Markdown supported)</span>
          </label>
          <textarea
            id="description"
            rows={8}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field resize-none font-mono text-sm"
            placeholder="**Bold text** and *italic text*&#10;&#10;- List item 1&#10;- List item 2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-gray-900 mb-2">
              📊 Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-bold text-gray-900 mb-2">
              🎯 Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field"
            >
              <option value="LOW">Low</option>
              <option value="MED">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-bold text-gray-900 mb-2">
              👤 Assignee
            </label>
            <select
              id="assignee"
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              className="input-field"
            >
              <option value="">Unassigned</option>
              {usersData?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="labels" className="block text-sm font-bold text-gray-900 mb-2">
            🏷️ Labels
            <span className="text-gray-500 font-normal ml-2">(comma separated)</span>
          </label>
          <input
            id="labels"
            type="text"
            value={formData.labels}
            onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
            className="input-field"
            placeholder="bug, feature, urgent, documentation"
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary flex-1"
          >
            {createMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : (
              '✓ Create Issue'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}