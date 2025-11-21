'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Comment } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          💬 Comments
          {comments && comments.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {comments.length}
            </span>
          )}
        </h3>
      </div>

      {/* Crear comentario */}
      <form onSubmit={handleCreate} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comment..."
          rows={4}
          className="input-field resize-none"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !newComment.trim()}
          className="btn-primary"
        >
          {createMutation.isPending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Posting...
            </span>
          ) : (
            'Post Comment'
          )}
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {!comments || comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-3">💭</div>
            <p className="text-gray-600 font-medium">No comments yet</p>
            <p className="text-sm text-gray-500">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{comment.author.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {user?.id === comment.authorId && (
                  <div className="flex gap-2">
                    {editingId === comment.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs font-medium text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          ✕ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this comment?')) {
                              deleteMutation.mutate(comment.id)
                            }
                          }}
                          className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                        >
                          🗑️ Delete
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
                  rows={4}
                  className="input-field resize-none"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}