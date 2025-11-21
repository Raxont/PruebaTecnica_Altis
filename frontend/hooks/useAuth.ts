'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { User } from '@/types'

export function useAuth() {
  const router = useRouter()

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data
    },
    retry: false,
  })

  const logout = async () => {
    await api.post('/auth/logout')
    router.push('/login')
  }

  return { user, isLoading, error, logout }
}