'use client'

import { useState, useEffect } from 'react'

interface IssueFiltersProps {
  filters: {
    status: string
    priority: string
    assigneeId: string
    search: string
  }
  onFilterChange: (key: string, value: string) => void
  users: any[]
}

export default function IssueFilters({ filters, onFilterChange, users }: IssueFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search)

  // Sincronizar searchInput cuando filters.search cambie externamente
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  const handleSearch = () => {
    onFilterChange('search', searchInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔍 Search
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field flex-1"
            />
            <button
              onClick={handleSearch}
              className="btn-primary whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📊 Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🎯 Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="input-field"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MED">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            👤 Assignee
          </label>
          <select
            value={filters.assigneeId}
            onChange={(e) => onFilterChange('assigneeId', e.target.value)}
            className="input-field"
          >
            <option value="">All Assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mostrar filtros activos */}
      {(filters.search || filters.status || filters.priority || filters.assigneeId) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    setSearchInput('')
                    onFilterChange('search', '')
                  }}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                Status: {filters.status.replace('_', ' ')}
                <button
                  onClick={() => onFilterChange('status', '')}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                Priority: {filters.priority}
                <button
                  onClick={() => onFilterChange('priority', '')}
                  className="hover:text-yellow-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.assigneeId && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                Assignee: {users.find(u => u.id === parseInt(filters.assigneeId))?.name}
                <button
                  onClick={() => onFilterChange('assigneeId', '')}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchInput('')
                onFilterChange('clear', '')
              }}
              className="text-sm text-red-600 hover:text-red-800 font-medium ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}