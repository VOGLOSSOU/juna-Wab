'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Provider } from '@/types'

interface AuthState {
  user: User | null
  provider: Provider | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isProvider: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setProvider: (provider: Provider) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      provider: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isProvider: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isProvider: user.role === 'PROVIDER',
        })
      },

      setProvider: (provider) => set({ provider }),

      logout: () => {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            // Fire and forget — don't block the UI on logout API call
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://juna-app.up.railway.app/api/v1'}/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
              },
              body: JSON.stringify({ refreshToken }),
            }).catch(() => {})
          }
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
        set({
          user: null,
          provider: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isProvider: false,
        })
      },
    }),
    {
      name: 'juna-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isProvider: state.isProvider,
      }),
    }
  )
)
