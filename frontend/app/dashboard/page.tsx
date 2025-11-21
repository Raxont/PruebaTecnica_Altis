'use client'

import { useState } from 'react'
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

  const { data: usersData } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return [data]
    },
  })

  const { data, isLoading } = useQuery<IssuesResponse>({
    queryKey: ['issues', filters.status, filters.priority, filters.assigneeId, filters.search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
        ...(filters.search && { search: filters.search }),
      })
      const { data } = await api.get(`/issues?${params}`)
      return data
    },
  })

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'clear') {
      // Limpiar todos los filtros
      setFilters({
        status: '',
        priority: '',
        assigneeId: '',
        search: '',
      })
    } else {
      setFilters({ ...filters, [key]: value })
    }
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Issues</h1>
          <p className="text-gray-600">Manage and track your team's issues</p>
        </div>
        <Link
          href="/dashboard/issue/new"
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          New Issue
        </Link>
      </div>

      <IssueFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        users={usersData || []}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading issues...</p>
        </div>
      ) : !data?.issues.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-600 mb-6">Create your first issue to get started</p>
          <Link href="/dashboard/issue/new" className="btn-primary">
            + Create Issue
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {data.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 bg-white p-4 rounded-xl border border-gray-200">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <span className="text-xs text-gray-500">
                  ({data.pagination.total} total)
                </span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}