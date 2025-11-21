'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { IssuesResponse, User } from '@/types'
import IssueFilters from '@/components/IssueFilters'
import IssueCard from '@/components/IssueCard'
import Link from 'next/link'

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigneeId: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.search])

  const { data: usersData } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      // Por ahora solo devolvemos el usuario actual
      // En producción harías un endpoint GET /users de la org
      return [data]
    },
  })

  const { data, isLoading } = useQuery<IssuesResponse>({
    queryKey: ['issues', filters.status, filters.priority, filters.assigneeId, debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
        ...(debouncedSearch && { search: debouncedSearch }),
      })
      const { data } = await api.get(`/issues?${params}`)
      return data
    },
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
        <Link
          href="/dashboard/issue/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + New Issue
        </Link>
      </div>

      <IssueFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        users={usersData || []}
      />

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Loading...</div>
      ) : !data?.issues.length ? (
        <div className="text-center py-12 text-gray-600">No issues found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>

          {/* Paginación */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}