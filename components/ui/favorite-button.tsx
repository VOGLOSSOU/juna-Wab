'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
  const reduceMotion = useReducedMotion()
  const sequence = useRef(0)
  const [landing, setLanding] = useState<{ accountId: string; subscriptionId: string; sequence: number } | null>(null)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const selected = hydrated && !!userId && accountId === userId &&
    (override !== undefined && flagRevision > (subscription.favoriteRevision ?? -1)
      ? override : subscription.favoriteAccountId === userId && !!subscription.isFavorite)
  const showLanding = !reduceMotion && selected && landing?.accountId === userId && landing?.subscriptionId === subscription.id
  const label = selected ? 'Retirer des favoris' : 'Ajouter aux favoris'
  async function toggle() {
    if (!userId) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname + window.location.search)}`)
      return
    }
    const generation = useFavoritesStore.getState().generation
    const adding = !selected
    setLanding(null)
    try {
      await useFavoritesStore.getState().toggle(subscription.id, selected)
      const state = useFavoritesStore.getState()
      if (adding && !reduceMotion && state.generation === generation &&
          state.accountId === userId && state.flags[subscription.id] === true) {
        setLanding({ accountId: userId, subscriptionId: subscription.id, sequence: ++sequence.current })
      }
    } catch (error) {
      if (useAuthStore.getState().user?.id === userId) showApiError(error, 'Impossible de modifier vos favoris. Réessayez.')
    }
  }
  return (
    <button type="button" onClick={toggle} disabled={pending} aria-pressed={selected}
      aria-label={`${label} : ${subscription.name}`} title={label}
      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait ${selected ? 'text-accent' : 'text-text-primary'}`}>
      {showLanding && landing && <motion.span key={landing.sequence} aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-accent"
        initial={{ opacity: 0, y: -26, x: -5, scale: 0.65, rotate: -14 }}
        animate={{ opacity: [0, 1, 1, 0], y: [-26, -17, 0, 0], x: [-5, -3, 0, 0],
          scale: [0.65, 1, 1.05, 0.7], rotate: [-14, -8, 0, 0] }}
        transition={{ duration: 0.65, times: [0, 0.2, 0.65, 1], ease: 'easeOut' }}
        onAnimationComplete={() => setLanding(current => current?.sequence === landing.sequence ? null : current)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" />
        </svg>
      </motion.span>}
      {pending ? <span role="status" aria-label="Enregistrement" className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /> :
        <motion.span className="inline-flex" aria-hidden="true"
          animate={{ scale: showLanding ? [1, 1.22, 0.94, 1] : 1 }}
          transition={showLanding ? { duration: 0.35, delay: 0.3, times: [0, 0.4, 0.7, 1] } : { duration: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" />
        </svg>
        </motion.span>}
    </button>
  )
}
