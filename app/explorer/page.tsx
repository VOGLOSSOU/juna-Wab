'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { SubscriptionCard } from '@/components/cards/subscription-card'
import { SkeletonCard } from '@/components/ui/skeleton'
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
  { label: 'Récents', value: 'recent' },
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
  const [sheetOpen, setSheetOpen] = useState(false)

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
          setSubscriptions((prev) => {
            const existingIds = new Set(prev.map(s => s.id))
            return [...prev, ...data.items.filter(s => !existingIds.has(s.id))]
          })
          setPage((p) => p + 1)
        }
        setHasMore(data.hasMore)
        setTotal(data.total)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity, sort, category, type, duration, search]
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
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) fetchSubscriptions(false) },
      { threshold: 0.1 }
    )
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, fetchSubscriptions])

  function resetFilters() {
    setCategory(''); setType(''); setDuration(''); setSearch(''); setSort('popular')
  }

  const activeSecondaryCount = [category, duration].filter(Boolean).length

  if (!hasChosen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="text-text-light">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Choisissez votre ville</h2>
        <p className="text-text-secondary text-sm max-w-sm">Pour voir les abonnements disponibles près de chez vous.</p>
      </div>
    )
  }

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">

      {/* ── Barre recherche + tri + filtres ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Rechercher un abonnement, un traiteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-colors"
          />
        </div>

        {/* Bouton Filtres */}
        <button
          onClick={() => setSheetOpen(true)}
          className={`relative h-11 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors flex-shrink-0 ${
            activeSecondaryCount > 0
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-primary border-border hover:bg-surface-grey'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span className="hidden sm:inline">Filtres</span>
          {activeSecondaryCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center">
              {activeSecondaryCount}
            </span>
          )}
        </button>

        {/* Tri */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-11 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white flex-shrink-0 hidden sm:block"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Types — chips horizontal scroll ── */}
      <div>
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-1 px-1">
          {/* Chip "Tous" */}
          <button
            onClick={() => setType('')}
            className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors ${
              type === ''
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-surface-grey'
            }`}
          >
            Tous
          </button>

          {(Object.entries(SUBSCRIPTION_TYPE_LABELS) as [SubscriptionType, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setType(type === key ? '' : key)}
              className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                type === key
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-text-secondary hover:bg-surface-grey'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tri mobile */}
      <div className="flex items-center justify-between sm:hidden">
        <span className="text-sm text-text-secondary">
          {total > 0 ? `${total} résultat${total > 1 ? 's' : ''}` : ''}
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-9 px-3 rounded-lg border border-border text-sm focus:outline-none bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Résultats + compteur desktop */}
      <div className="hidden sm:flex items-center justify-between -mt-2">
        {total > 0 && (
          <span className="text-sm text-text-secondary">{total} résultat{total > 1 ? 's' : ''}</span>
        )}
        {(type || category || duration || search) && (
          <button onClick={resetFilters} className="text-sm text-primary hover:underline font-medium">
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* ── Grille résultats ── */}
      {subscriptions.length === 0 && !loading ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-grey flex items-center justify-center text-text-light">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-text-primary">Aucun résultat</p>
            <p className="text-sm text-text-secondary mt-1">Aucun abonnement trouvé à {selectedCity?.name}.</p>
          </div>
          {(category || type || duration || search) && (
            <button onClick={resetFilters} className="text-sm text-primary font-medium hover:underline">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} />
          ))}
          {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
        </div>
      )}

      <div ref={observerRef} className="h-4" />

      {/* ── Sheet filtres (Durée + Catégorie) ── */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSheetOpen(false)}
          />

          {/* Panel — bottom sheet sur mobile, drawer à droite sur desktop */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:right-0 md:top-0 md:bottom-0 md:w-80 bg-white md:border-l border-t md:border-t-0 border-border rounded-t-3xl md:rounded-none shadow-xl animate-slide-up md:animate-none flex flex-col">

            {/* Handle mobile */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-4 md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
              <h3 className="font-semibold text-text-primary">Filtres</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-grey transition-colors text-text-secondary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7">

              {/* Durée */}
              <div>
                <p className="text-xs font-semibold text-text-light uppercase tracking-widest mb-3">Durée</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(SUBSCRIPTION_DURATION_LABELS) as [SubscriptionDuration, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setDuration(duration === key ? '' : key)}
                      className={`h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                        duration === key
                          ? 'bg-primary text-white'
                          : 'bg-surface-grey text-text-primary hover:bg-border'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <p className="text-xs font-semibold text-text-light uppercase tracking-widest mb-3">Catégorie</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(SUBSCRIPTION_CATEGORY_LABELS) as [SubscriptionCategory, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(category === key ? '' : key)}
                      className={`h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                        category === key
                          ? 'bg-primary text-white'
                          : 'bg-surface-grey text-text-primary hover:bg-border'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-divider flex gap-3">
              <button
                onClick={() => { setCategory(''); setDuration('') }}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
              >
                Voir les résultats
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
