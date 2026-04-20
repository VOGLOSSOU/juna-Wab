'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { SubscriptionCard } from '@/components/cards/subscription-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useCityStore } from '@/lib/store/city'
import { getSubscriptions } from '@/lib/api/subscriptions'
import {
  SUBSCRIPTION_TYPE_LABELS,
  SUBSCRIPTION_CATEGORY_LABELS,
  SUBSCRIPTION_DURATION_LABELS,
} from '@/lib/utils'
import type { Subscription, SubscriptionType, SubscriptionCategory, SubscriptionDuration, SortOption } from '@/types'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Populaires', value: 'popular' },
  { label: 'Plus récents', value: 'recent' },
  { label: 'Prix croissant', value: 'price_asc' },
  { label: 'Prix décroissant', value: 'price_desc' },
  { label: 'Mieux notés', value: 'rating' },
]

export default function ExplorerPage() {
  const { selectedCity, hasChosen } = useCityStore()

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('popular')
  const [category, setCategory] = useState<SubscriptionCategory | ''>('')
  const [type, setType] = useState<SubscriptionType | ''>('')
  const [duration, setDuration] = useState<SubscriptionDuration | ''>('')

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef = useRef<HTMLDivElement | null>(null)

  const fetchSubscriptions = useCallback(
    async (reset = false) => {
      if (!selectedCity) return
      const currentPage = reset ? 1 : page
      setLoading(true)
      try {
        const data = await getSubscriptions({
          cityId: selectedCity.id,
          sort,
          page: currentPage,
          limit: 20,
          ...(category && { category }),
          ...(type && { type }),
          ...(duration && { duration }),
          ...(search && { search }),
        })
        if (reset) {
          setSubscriptions(data.items)
          setPage(2)
        } else {
          setSubscriptions((prev) => [...prev, ...data.items])
          setPage((p) => p + 1)
        }
        setHasMore(data.hasMore)
        setTotal(data.total)
      } catch {
        // handle silently
      } finally {
        setLoading(false)
      }
    },
    [selectedCity, sort, category, type, duration, search, page]
  )

  useEffect(() => {
    if (selectedCity) fetchSubscriptions(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, sort, category, type, duration])

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      if (selectedCity) fetchSubscriptions(true)
    }, 350)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchSubscriptions(false)
        }
      },
      { threshold: 0.1 }
    )
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, fetchSubscriptions])

  const resetFilters = () => {
    setCategory('')
    setType('')
    setDuration('')
    setSearch('')
    setSort('popular')
  }

  if (!hasChosen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="text-text-light"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <h2 className="text-headline-medium font-semibold">Choisissez votre ville</h2>
        <p className="text-text-secondary text-body-medium max-w-sm">
          Pour voir les abonnements disponibles près de chez vous.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-content mx-auto px-6 py-8 flex gap-8">
      {/* Sidebar filtres */}
      <aside className="hidden lg:flex flex-col gap-6 w-sidebar flex-shrink-0">
        <div>
          <h3 className="font-semibold text-sm text-text-primary mb-3">Catégorie</h3>
          <div className="flex flex-col gap-1">
            {(Object.keys(SUBSCRIPTION_CATEGORY_LABELS) as SubscriptionCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? '' : cat)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  category === cat
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-grey'
                }`}
              >
                {SUBSCRIPTION_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-text-primary mb-3">Type de repas</h3>
          <div className="flex flex-col gap-1">
            {(Object.keys(SUBSCRIPTION_TYPE_LABELS) as SubscriptionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(type === t ? '' : t)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  type === t
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-grey'
                }`}
              >
                {SUBSCRIPTION_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-text-primary mb-3">Durée</h3>
          <div className="flex flex-col gap-1">
            {(Object.keys(SUBSCRIPTION_DURATION_LABELS) as SubscriptionDuration[]).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(duration === d ? '' : d)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  duration === d
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-surface-grey'
                }`}
              >
                {SUBSCRIPTION_DURATION_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={resetFilters}>
          Réinitialiser les filtres
        </Button>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Barre de recherche + tri */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Rechercher un abonnement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            {total > 0 && (
              <span className="text-sm text-text-secondary whitespace-nowrap">{total} résultat{total > 1 ? 's' : ''}</span>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille */}
        {subscriptions.length === 0 && !loading ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="text-text-light"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
            <p className="text-text-secondary">Aucun abonnement trouvé à {selectedCity?.name}.</p>
            {(category || type || duration || search) && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
          </div>
        )}

        <div ref={observerRef} className="h-4" />
      </div>
    </div>
  )
}
