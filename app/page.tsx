'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GeoModal } from '@/components/modals/geo-modal'
import { Hero } from '@/components/layout/hero'
import { SubscriptionCard } from '@/components/cards/subscription-card'
import { ProviderCard } from '@/components/cards/provider-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useCityStore } from '@/lib/store/city'
import { getHome } from '@/lib/api/subscriptions'
import type { HomeResponse } from '@/types'

export default function HomePage() {
  const { selectedCity, hasChosen } = useCityStore()
  const [data, setData] = useState<HomeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!selectedCity) return
    setLoading(true)
    setError(false)
    getHome(selectedCity.id)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [selectedCity])

  return (
    <>
      <GeoModal />

      <Hero />

      <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-12">

        {/* Réseau wifi off */}
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

        {/* Populaires */}
        {hasChosen && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-large font-semibold text-text-primary">
                Les plus populaires{selectedCity ? ` à ${selectedCity.name}` : ''}
              </h2>
              <Link href="/explorer" className="text-sm font-medium text-primary hover:underline flex-shrink-0">
                Découvrir
              </Link>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-shrink-0 w-64"><SkeletonCard /></div>)}
              </div>
            ) : data?.popular?.length ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {data.popular.map((sub) => (
                  <div key={sub.id} className="flex-shrink-0 w-52 h-full">
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

        {/* Récents */}
        {hasChosen && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-large font-semibold text-text-primary">Nouveautés</h2>
              <Link href="/explorer?sort=recent" className="text-sm font-medium text-primary hover:underline flex-shrink-0">
                Découvrir
              </Link>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-shrink-0 w-64"><SkeletonCard /></div>)}
              </div>
            ) : data?.recent?.length ? (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
                {data.recent.map((sub) => (
                  <div key={sub.id} className="flex-shrink-0 w-52 h-full">
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

        {/* Prestataires */}
        {hasChosen && data?.providers?.length ? (
          <section>
            <h2 className="text-headline-large font-semibold text-text-primary mb-6">Nos prestataires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Pas de ville choisie */}
        {!hasChosen && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="text-text-light"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <h2 className="text-headline-medium font-semibold text-text-primary">
              Où êtes-vous ?
            </h2>
            <p className="text-text-secondary text-body-medium max-w-sm">
              Choisissez votre ville pour découvrir les abonnements repas disponibles près de chez vous.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
