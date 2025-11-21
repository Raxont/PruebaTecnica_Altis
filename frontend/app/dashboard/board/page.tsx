'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core'
import api from '@/lib/api'
import { Issue } from '@/types'
import KanbanColumn from '@/components/KanbanColumn'
import KanbanCard from '@/components/KanbanCard'

export default function BoardPage() {
  const queryClient = useQueryClient()
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reducido para que sea más fácil arrastrar
      },
    })
  )

  const { data: allIssues, isLoading } = useQuery<Issue[]>({
    queryKey: ['issues-board'],
    queryFn: async () => {
      const { data } = await api.get('/issues?limit=1000')
      return data.issues
    },
  })

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.put(`/issues/${id}`, { status })
      return data
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['issues-board'] })
      const previousIssues = queryClient.getQueryData<Issue[]>(['issues-board'])

      queryClient.setQueryData<Issue[]>(['issues-board'], (old) => {
        if (!old) return old
        return old.map((issue) =>
          issue.id === id ? { ...issue, status: status as any } : issue
        )
      })

      return { previousIssues }
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(['issues-board'], context.previousIssues)
      }
    },
    onSettled: () => {
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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    
    // Detectar sobre qué columna está
    if (over && ['TODO', 'IN_PROGRESS', 'DONE'].includes(over.id as string)) {
      setOverId(over.id as string)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveIssue(null)
    setOverId(null)

    if (!over) return

    const issueId = active.id as number
    let newStatus = over.id as string

    // Si se soltó sobre una card, usar el status de esa columna
    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(newStatus)) {
      const overIssue = issues.find((i) => i.id === over.id)
      if (overIssue) {
        newStatus = overIssue.status
      } else {
        return
      }
    }

    const issue = issues.find((i) => i.id === issueId)
    if (!issue || issue.status === newStatus) return

    updateIssueMutation.mutate({ id: issueId, status: newStatus })
  }

  const handleDragCancel = () => {
    setActiveIssue(null)
    setOverId(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading board...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Kanban Board</h1>
        <p className="text-gray-600">Drag and drop issues to update their status</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
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

        <DragOverlay dropAnimation={null}>
          {activeIssue ? (
            <div className="opacity-80 scale-105">
              <KanbanCard issue={activeIssue} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}