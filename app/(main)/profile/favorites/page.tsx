'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { useAuthStore } from '@/lib/store/auth'
import { useFavoritesStore } from '@/lib/store/favorites'
import { getFavorites, type FavoritesResponse } from '@/lib/api/favorites'
import { SubscriptionCard } from '@/components/cards/subscription-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function FavoritesPage() {
  const { hydrated, isAuthenticated } = useAuthGuard()
  const userId = useAuthStore(state => state.user?.id)
  const revision = useFavoritesStore(state => state.revision)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<{ accountId: string; data: FavoritesResponse } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => { setPage(1); setResult(null) }, [userId])
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !userId) return
    let current = true
    setLoading(true)
    setError(false)
    getFavorites(page).then(data => {
      if (!current) return
      if (!data.favorites.length && page > 1) {
        setPage(Math.max(1, Math.min(page - 1, data.pagination.totalPages)))
        return
      }
      setResult({ accountId: userId, data })
    }).catch(() => { if (current) setError(true) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [hydrated, isAuthenticated, userId, page, revision, retry])

  if (!hydrated || !isAuthenticated) return null
  const data = result && result.accountId === userId ? result.data : null
  const favorites = data?.favorites ?? []
  return (
    <div className="mx-auto flex max-w-content flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-large font-semibold">Mes favoris</h1>
        <button type="button" onClick={() => setRetry(value => value + 1)} disabled={loading}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary disabled:opacity-50">Actualiser</button>
      </div>
      <p className="text-sm text-text-secondary">Retrouvez les abonnements enregistrés sur votre compte.</p>
      {error && <div role="alert" className="rounded-xl border border-border bg-white p-5">
        <p>Impossible de charger vos favoris.</p>
        <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 text-sm font-semibold text-primary">Réessayer</button>
      </div>}
      {loading ? <div aria-busy="true" aria-label="Chargement des favoris" className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
      </div> : favorites.length ? <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
      </div> : !error && <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <p className="font-semibold">Aucun favori pour le moment.</p>
        <p className="mt-2 text-sm text-text-secondary">Touchez le cœur d’un abonnement pour le retrouver ici.</p>
        <Link href="/explorer" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Explorer les abonnements</Link>
      </div>}
      {data && data.pagination.totalPages > 1 && <nav aria-label="Pages des favoris" className="flex items-center justify-center gap-4">
        <button type="button" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">Précédent</button>
        <span className="text-sm text-text-secondary">{page} / {data.pagination.totalPages}</span>
        <button type="button" disabled={loading || page >= data.pagination.totalPages} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">Suivant</button>
      </nav>}
    </div>
  )
}
