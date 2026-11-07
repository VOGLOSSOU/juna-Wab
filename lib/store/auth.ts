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
  sessionExpired: boolean
  authRevision: number
  expireSession: () => void
  clearSessionNotice: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setProvider: (provider: Provider) => void
  updateUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      provider: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isProvider: false,
      sessionExpired: false,
      authRevision: 0,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
        set({
          user,
          provider: null,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isProvider: user.role === 'PROVIDER',
          sessionExpired: false,
          authRevision: get().authRevision + 1,
        })
      },

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
        set({ accessToken, refreshToken })
      },
      clearSessionNotice: () => set({ sessionExpired: false }),
      expireSession: () => {
        const hadSession = get().isAuthenticated && !!get().user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
        set({ user: null, provider: null, accessToken: null, refreshToken: null,
          isAuthenticated: false, isProvider: false, sessionExpired: hadSession,
          authRevision: get().authRevision + 1 })
      },
      setProvider: (provider) => set({ provider }),

      updateUser: (user) => set(state => state.isAuthenticated && state.user?.id === user.id ? { user } : state),

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
          sessionExpired: false,
          authRevision: get().authRevision + 1,
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
