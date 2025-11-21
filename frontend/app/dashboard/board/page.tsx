'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import api from '@/lib/api'
import { Issue } from '@/types'
import KanbanColumn from '@/components/KanbanColumn'
import KanbanCard from '@/components/KanbanCard'

export default function BoardPage() {
  const queryClient = useQueryClient()
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Cargar todos los issues sin paginación para el tablero
  const { data: allIssues, isLoading } = useQuery<Issue[]>({
    queryKey: ['issues-board'],
    queryFn: async () => {
      const { data } = await api.get('/issues?limit=1000')
      return data.issues
    },
  })

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/issues/${id}`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues-board'] })
    },
  })

  const issues = allIssues || []
  const todoIssues = issues.filter((i) => i.status === 'TODO')
  const inProgressIssues = issues.filter((i) => i.status === 'IN_PROGRESS')
  const doneIssues = issues.filter((i) => i.status === 'DONE')

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id)
    setActiveIssue(issue || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveIssue(null)

    if (!over) return

    const issueId = active.id as number
    const newStatus = over.id as string

    const issue = issues.find((i) => i.id === issueId)
    if (!issue || issue.status === newStatus) return

    // Actualizar optimistamente
    queryClient.setQueryData(['issues-board'], (old: Issue[] | undefined) => {
      if (!old) return old
      return old.map((i) =>
        i.id === issueId ? { ...i, status: newStatus as any } : i
      )
    })

    // Actualizar en servidor
    updateIssueMutation.mutate({ id: issueId, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading board...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Kanban Board</h1>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            title="To Do"
            status="TODO"
            issues={todoIssues}
            count={todoIssues.length}
          />
          <KanbanColumn
            title="In Progress"
            status="IN_PROGRESS"
            issues={inProgressIssues}
            count={inProgressIssues.length}
          />
          <KanbanColumn
            title="Done"
            status="DONE"
            issues={doneIssues}
            count={doneIssues.length}
          />
        </div>

        <DragOverlay>
          {activeIssue ? <KanbanCard issue={activeIssue} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}