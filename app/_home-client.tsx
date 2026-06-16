'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { GeoModal } from '@/components/modals/geo-modal'
import { Hero } from '@/components/layout/hero'
import { SubscriptionCard } from '@/components/cards/subscription-card'
import { ProviderCard } from '@/components/cards/provider-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useCityStore } from '@/lib/store/city'
import { getHome, getSubscriptions } from '@/lib/api/subscriptions'
import type { HomeResponse, Subscription } from '@/types'

export default function HomeClient() {
  const { selectedCity, hasChosen } = useCityStore()
  const [data, setData] = useState<HomeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Subscription[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!selectedCity) return
    setLoading(true)
    setError(false)
    getHome(selectedCity.id)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [selectedCity])

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!search.trim() || !selectedCity) { setSearchResults([]); return }
    setSearchLoading(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await getSubscriptions({ search, cityId: selectedCity.id, limit: 20 })
        setSearchResults(res.items)
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      } catch { /* silent */ } finally {
        setSearchLoading(false)
      }
    }, 350)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [search, selectedCity])

  return (
    <>
      <GeoModal />

      <Hero searchValue={search} onSearchChange={setSearch} />

      <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-12">

        {/* Résultats de recherche */}
        {search.trim() && (
          <section ref={resultsRef}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-large font-semibold text-text-primary">
                Résultats pour <span className="text-primary">&ldquo;{search}&rdquo;</span>
              </h2>
              <button
                onClick={() => setSearch('')}
                className="text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Effacer
              </button>
            </div>
            {searchLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : searchResults.length ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {searchResults.map((sub) => <SubscriptionCard key={sub.id} subscription={sub} />)}
              </div>
            ) : (
              <p className="text-text-secondary text-sm py-8 text-center">
                Aucun résultat pour &ldquo;{search}&rdquo;.
              </p>
            )}
          </section>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-16 text-text-secondary">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
              <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0122.56 9" />
              <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
              <path d="M8.53 16.11a6 6 0 016.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <p className="text-sm">Erreur de connexion. Vérifiez votre réseau.</p>
            <button
              onClick={() => selectedCity && getHome(selectedCity.id).then(setData).catch(() => setError(true))}
              className="text-primary text-sm font-medium hover:underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {hasChosen && !search.trim() && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-large font-semibold text-text-primary">
                Les plus populaires{selectedCity ? ` à ${selectedCity.name}` : ''}
              </h2>
              <Link href="/explorer" className="text-xs font-medium text-primary flex items-center gap-0.5 hover:gap-1.5 transition-all flex-shrink-0">
                Explorer <span aria-hidden>→</span>
              </Link>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-shrink-0 w-48 h-[268px]"><SkeletonCard /></div>)}
              </div>
            ) : data?.popular?.length ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {data.popular.map((sub) => (
                  <div key={sub.id} className="flex-shrink-0 w-48 h-[268px]">
                    <SubscriptionCard subscription={sub} variant="compact" />
                  </div>
                ))}
              </div>
            ) : !loading && !error && (
              <p className="text-text-secondary text-sm py-8 text-center">
                Aucun abonnement populaire pour l&apos;instant.
              </p>
            )}
          </section>
        )}

        {hasChosen && !search.trim() && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-large font-semibold text-text-primary">Nouveautés</h2>
              <Link href="/explorer?sort=recent" className="text-xs font-medium text-primary flex items-center gap-0.5 hover:gap-1.5 transition-all flex-shrink-0">
                Explorer <span aria-hidden>→</span>
              </Link>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-shrink-0 w-48 h-[268px]"><SkeletonCard /></div>)}
              </div>
            ) : data?.recent?.length ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {data.recent.map((sub) => (
                  <div key={sub.id} className="flex-shrink-0 w-48 h-[268px]">
                    <SubscriptionCard subscription={sub} variant="compact" />
                  </div>
                ))}
              </div>
            ) : !loading && !error && (
              <p className="text-text-secondary text-sm py-8 text-center">
                Aucune nouveauté pour l&apos;instant.
              </p>
            )}
          </section>
        )}

        {hasChosen && !search.trim() && data?.providers?.length ? (
          <section>
            <h2 className="text-headline-large font-semibold text-text-primary mb-6">Nos prestataires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>
        ) : null}

        {!hasChosen && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="text-text-light"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <h2 className="text-headline-medium font-semibold text-text-primary">{"Où êtes-vous ?"}</h2>
            <p className="text-text-secondary text-body-medium max-w-sm">
              {"Choisissez votre ville pour découvrir les abonnements repas disponibles près de chez vous."}
            </p>
          </div>
        )}

        {/* Comment ça marche */}
        <section className="bg-primary-surface rounded-2xl px-8 py-12">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">{"Comment ça marche ?"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{"Étape 1"}</div>
                <h3 className="font-semibold text-text-primary mb-2">{"Choisissez votre ville"}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{"Sélectionnez votre localisation pour découvrir les abonnements repas disponibles autour de vous."}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <path d="M12 18h.01M9 7h6M9 11h4"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{"Étape 2"}</div>
                <h3 className="font-semibold text-text-primary mb-2">{"Souscrivez à un abonnement"}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{"Choisissez votre formule (petit-déjeuner, déjeuner, dîner) et payez en quelques secondes via Mobile Money."}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{"Étape 3"}</div>
                <h3 className="font-semibold text-text-primary mb-2">{"Recevez vos repas"}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{"Livraison à domicile ou retrait sur place — votre prestataire prépare vos repas chaque jour."}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi Juna */}
        <section className="pb-4">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">{"Pourquoi choisir Juna ?"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-surface flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{"Prestataires locaux"}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{"Des cuisiniers et traiteurs de votre quartier. Repas faits maison, vrais ingrédients, saveurs locales."}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-surface flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="1.8">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <path d="M12 18h.01"/>
                  <path d="M9 7h6M9 11h6"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{"Paiement Mobile Money"}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{"Payez facilement avec MTN MoMo, Moov Money ou Orange Money. Rapide, simple, sécurisé."}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-surface flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{"Abonnez-vous une fois"}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{"Livraison à domicile ou retrait sur place, vous choisissez. Souscrivez une fois, mangez bien tous les jours."}</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
