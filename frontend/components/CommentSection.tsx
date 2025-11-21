'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Comment } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'

interface CommentSectionProps {
  issueId: number
}

export default function CommentSection({ issueId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      const { data } = await api.get(`/comments/issue/${issueId}`)
      return data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post('/comments', { content, issueId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
      setNewComment('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      await api.put(`/comments/${id}`, { content })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/comments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      createMutation.mutate(newComment)
    }
  }

  const handleUpdate = (id: number) => {
    if (editContent.trim()) {
      updateMutation.mutate({ id, content: editContent })
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Comments</h3>

      {/* Crear comentario */}
      <form onSubmit={handleCreate} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {createMutation.isPending ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-3">
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">
                  {comment.author.name}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>

              {user?.id === comment.authorId && (
                <div className="flex gap-2">
                  {editingId === comment.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(comment.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this comment?')) {
                            deleteMutation.mutate(comment.id)
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {editingId === comment.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}