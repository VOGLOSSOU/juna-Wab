'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { useFavoritesStore } from '@/lib/store/favorites'
import { showApiError } from '@/lib/utils/api-error'
import type { Subscription } from '@/types'

export function FavoriteButton({ subscription }: { subscription: Subscription }) {
  const router = useRouter()
  const pathname = usePathname()
  const userId = useAuthStore(state => state.isAuthenticated ? state.user?.id : undefined)
  const accountId = useFavoritesStore(state => state.accountId)
  const override = useFavoritesStore(state => state.flags[subscription.id])
  const flagRevision = useFavoritesStore(state => state.flagRevisions[subscription.id] ?? -1)
  const pending = useFavoritesStore(state => !!state.pending[subscription.id])
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const selected = hydrated && !!userId && accountId === userId &&
    (override !== undefined && flagRevision > (subscription.favoriteRevision ?? -1)
      ? override : subscription.favoriteAccountId === userId && !!subscription.isFavorite)
  const label = selected ? 'Retirer des favoris' : 'Ajouter aux favoris'
  async function toggle() {
    if (!userId) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname + window.location.search)}`)
      return
    }
    try {
      await useFavoritesStore.getState().toggle(subscription.id, selected)
    } catch (error) {
      if (useAuthStore.getState().user?.id === userId) showApiError(error, 'Impossible de modifier vos favoris. Réessayez.')
    }
  }
  return (
    <button type="button" onClick={toggle} disabled={pending} aria-pressed={selected}
      aria-label={`${label} : ${subscription.name}`} title={label}
      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait ${selected ? 'text-accent' : 'text-text-primary'}`}>
      {pending ? <span role="status" aria-label="Enregistrement" className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /> :
        <svg width="20" height="20" viewBox="0 0 24 24" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" />
        </svg>}
    </button>
  )
}
