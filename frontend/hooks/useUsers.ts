'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { User } from '@/types'

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users')
      return data
    },
  })
}