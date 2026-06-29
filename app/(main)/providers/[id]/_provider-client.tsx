/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPublicProvider } from '@/lib/api/providers'
import { SubscriptionCard } from '@/components/cards/subscription-card'
import { StarRating } from '@/components/ui/star-rating'
import { formatPrice, getInitials } from '@/lib/utils'
import type { PublicProviderProfile, Meal, MealPriceType } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────

function mealDisplayPrice(meal: Meal): string | null {
  if (meal.priceType === 'MULTIPLE' && meal.pricings?.length) {
    return `À partir de ${formatPrice(Math.min(...meal.pricings.map(p => p.price)))}`
  }
  if (meal.priceType === 'RANGE' && meal.priceMin != null && meal.priceMax != null) {
    return `${formatPrice(meal.priceMin)} – ${formatPrice(meal.priceMax)}`
  }
  if (meal.price != null) return formatPrice(meal.price)
  return null
}

function formatMemberSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

// ─── Skeleton ────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 bg-[#1a3a22]" />
      <div className="max-w-content mx-auto px-6">
        <div className="flex flex-col items-center -mt-12 mb-8 gap-4">
          <div className="w-24 h-24 rounded-full bg-white/20" />
          <div className="h-6 w-48 bg-surface-grey rounded-lg" />
          <div className="h-4 w-32 bg-surface-grey rounded-lg" />
        </div>
        <div className="flex flex-col gap-8">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-5 w-40 bg-surface-grey rounded mb-4" />
              <div className="flex gap-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex-shrink-0 w-48 h-[268px] bg-surface-grey rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────

export default function ProviderProfileClient() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [provider, setProvider] = useState<PublicProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getPublicProvider(id)
      .then(setProvider)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <ProfileSkeleton />

  if (notFound || !provider) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-surface-grey flex items-center justify-center text-text-light">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Prestataire introuvable</h1>
        <p className="text-text-secondary text-sm max-w-xs">Ce prestataire n'existe pas ou n'est plus disponible sur Juna.</p>
        <button onClick={() => router.back()} className="text-primary text-sm font-medium hover:underline">
          ← Retour
        </button>
      </div>
    )
  }

  const cityLabel = provider.city
    ? `${provider.city.name}${provider.city.country?.translations?.fr ? `, ${provider.city.country.translations.fr}` : ''}`
    : null

  const hasSubscriptions = (provider.subscriptions?.length ?? 0) > 0
  const hasMeals = (provider.meals?.length ?? 0) > 0
  const hasPickupPoints = (provider.pickupPoints?.length ?? 0) > 0
  const hasDeliveryZones = (provider.deliveryZones?.length ?? 0) > 0

  return (
    <div className="pb-16">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#0c2214] via-[#163320] to-[#1f4a2e] overflow-hidden">
        {/* Texture subtile */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/[0.06] to-transparent" />

        <div className="relative max-w-content mx-auto px-6 pt-10 pb-14 flex flex-col items-center text-center gap-5">

          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/10 border-[3px] border-white/20 shadow-2xl flex items-center justify-center flex-shrink-0">
            {provider.logo ? (
              <Image src={provider.logo} alt={provider.businessName} fill sizes="96px" className="object-cover" />
            ) : (
              <span className="font-bold text-white text-3xl">{getInitials(provider.businessName)}</span>
            )}
          </div>

          {/* Nom + badge vérifié */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <h1 className="text-2xl font-bold text-white leading-tight">{provider.businessName}</h1>
              {provider.isVerified && (
                <span className="flex items-center gap-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Vérifié
                </span>
              )}
            </div>

            {/* Note */}
            {provider.rating !== undefined && (provider.reviewCount ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={provider.rating} size={16} readOnly />
                <span className="text-white/70 text-sm">{provider.rating.toFixed(1)}</span>
                <span className="text-white/40 text-sm">({provider.reviewCount} avis)</span>
              </div>
            )}

            {/* Ville */}
            {cityLabel && (
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {cityLabel}
              </div>
            )}

            {/* Membre depuis */}
            {provider.memberSince && (
              <p className="text-white/40 text-xs">Membre depuis {formatMemberSince(provider.memberSince)}</p>
            )}
          </div>

          {/* Chips livraison / retrait */}
          {(provider.acceptsDelivery || provider.acceptsPickup) && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {provider.acceptsDelivery && (
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  Livraison
                </span>
              )}
              {provider.acceptsPickup && (
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Retrait sur place
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Corps ────────────────────────────────────────────── */}
      <div className="max-w-content mx-auto px-6 flex flex-col gap-10 pt-10">

        {/* Description */}
        {provider.description && (
          <div className="flex flex-col gap-2">
            <p className="text-text-secondary text-sm leading-relaxed">{provider.description}</p>
          </div>
        )}

        {/* Adresse + zones de livraison */}
        {(provider.businessAddress || hasDeliveryZones) && (
          <div className="flex flex-col gap-3">
            {provider.businessAddress && (
              <div className="flex items-start gap-3 bg-surface-grey rounded-xl px-4 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary flex-shrink-0 mt-0.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p className="text-sm text-text-primary">{provider.businessAddress}</p>
              </div>
            )}
            {hasDeliveryZones && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Zones de livraison</p>
                <div className="flex flex-wrap gap-2">
                  {provider.deliveryZones!.map((zone) => (
                    <span key={zone} className="bg-primary-surface text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/15">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Abonnements */}
        {hasSubscriptions && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-bold text-text-primary">Abonnements</h2>
                <span className="text-sm text-text-secondary font-normal">{provider.subscriptions!.length}</span>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
              {provider.subscriptions!.map((sub) => (
                <div key={sub.id} className="flex-shrink-0 w-52 h-[280px]">
                  <SubscriptionCard subscription={sub} variant="compact" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Plats */}
        {hasMeals && (
          <section>
            <div className="flex items-baseline gap-2 mb-5">
              <h2 className="text-xl font-bold text-text-primary">Plats proposés</h2>
              <span className="text-sm text-text-secondary font-normal">{provider.meals!.length}</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
              {provider.meals!.map((meal) => {
                const price = mealDisplayPrice(meal)
                return (
                  <div key={meal.id} className="flex-shrink-0 w-40 flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-28 bg-surface-grey">
                      {meal.imageUrl ? (
                        <Image src={meal.imageUrl} alt={meal.name} fill sizes="160px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-light">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                        </div>
                      )}
                      {meal.priceType === 'MULTIPLE' && (
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Variantes</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug">{meal.name}</p>
                      {meal.description && (
                        <p className="text-[10px] text-text-secondary line-clamp-2 leading-tight">{meal.description}</p>
                      )}
                      {price && <p className="text-xs font-bold text-primary mt-auto pt-1">{price}</p>}
                      {meal.priceGuideline && (
                        <p className="text-[10px] text-text-light italic leading-tight">{meal.priceGuideline}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Points de retrait */}
        {hasPickupPoints && (
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Points de retrait</h2>
            <div className="flex flex-col gap-2">
              {provider.pickupPoints!.map((point) => (
                <div key={point.id} className="flex items-center gap-3 bg-surface-grey rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="2.2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <p className="text-sm text-text-primary font-medium">{point.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vide */}
        {!hasSubscriptions && !hasMeals && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-grey flex items-center justify-center text-text-light">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            </div>
            <p className="text-text-secondary text-sm">Ce prestataire n'a pas encore publié de contenu.</p>
          </div>
        )}

        {/* Back */}
        <div className="pt-2">
          <Link href="/" className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors w-fit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Retour à l'accueil
          </Link>
        </div>

      </div>
    </div>
  )
}
