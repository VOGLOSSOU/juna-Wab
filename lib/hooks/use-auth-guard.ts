'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'

export function useAuthGuard(redirectTo = '/auth/login') {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.push(`${redirectTo}?redirect=${window.location.pathname}`)
    }
  }, [hydrated, isAuthenticated, router, redirectTo])

  return { isAuthenticated, hydrated }
}
