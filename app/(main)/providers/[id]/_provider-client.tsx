/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'
import { formatPrice, getInitials, mealDisplayPrice } from '@/lib/utils'
import type { PublicProviderProfile } from '@/types'

const API_URL = 'https://juna-app.up.railway.app/api/v1'

async function fetchProvider(id: string): Promise<PublicProviderProfile | null> {
  try {
    const res = await fetch(`${API_URL}/providers/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function formatMemberSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function safeRating(value: unknown): number {
  const n = Number(value)
  return isNaN(n) ? 0 : n
}

// ─── Skeleton ────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-[#1a3a22]" />
      <div className="max-w-content mx-auto px-6 pt-10">
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
  const [coverIndex, setCoverIndex] = useState(0)
  const [tabOverride, setTabOverride] = useState<'subscriptions' | 'meals' | null>(null)

  useEffect(() => {
    if (!id) return
    fetchProvider(id)
      .then((data) => {
        if (!data) router.push('/')
        else setProvider(data)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const subscriptions = provider?.subscriptions ?? []
  const meals = provider?.meals ?? []

  const coverItems = subscriptions
    .map((s) => ({ id: s.id, image: s.images?.[0] ?? s.imageUrl }))
    .filter((s): s is { id: string; image: string } => !!s.image)

  useEffect(() => {
    if (coverItems.length <= 1) return
    const t = setInterval(() => setCoverIndex((i) => (i + 1) % coverItems.length), 4000)
    return () => clearInterval(t)
  }, [coverItems.length])

  if (loading) return <ProfileSkeleton />
  if (!provider) return null

  const rating = safeRating(provider.rating)
  const reviewCount = provider.reviewCount ?? 0

  const cityLabel = provider.city
    ? `${provider.city.name}${provider.city.country?.translations?.fr ? `, ${provider.city.country.translations.fr}` : ''}`
    : null

  const pickupPoints = provider.pickupPoints ?? []
  const deliveryZones = provider.deliveryZones ?? []

  const activeTab = tabOverride ?? (subscriptions.length > 0 ? 'subscriptions' : 'meals')
  const showTabs = subscriptions.length > 0 && meals.length > 0

  return (
    <div className="pb-16">

      {/* ── Couverture ───────────────────────────────────────── */}
      <div className="relative h-60 md:h-80 bg-gradient-to-br from-[#0c2214] via-[#163320] to-[#1f4a2e] overflow-hidden">
        {coverItems.length > 0 ? (
          coverItems.map((item, i) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === coverIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image src={item.image} alt="" fill sizes="100vw" priority={i === 0} className="object-cover" />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.3" className="opacity-20">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        {/* Lien vers l'abonnement affiché */}
        {coverItems.length > 0 && (
          <Link
            href={`/subscriptions/${coverItems[coverIndex].id}`}
            className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-semibold pl-3 pr-2.5 py-1.5 rounded-full hover:bg-black/55 transition-colors"
          >
            Voir l'offre
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </Link>
        )}

        {/* Indicateurs de défilement */}
        {coverItems.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {coverItems.map((item, i) => (
              <span
                key={item.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === coverIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Avatar + identité ────────────────────────────────── */}
      <div className="max-w-content mx-auto px-6">
        <div className="-mt-12 flex flex-col items-center text-center gap-3">

          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-primary-surface border-4 border-white shadow-xl flex items-center justify-center flex-shrink-0">
            {provider.logo ? (
              <Image src={provider.logo} alt={provider.businessName} fill sizes="96px" className="object-cover" />
            ) : (
              <span className="font-bold text-primary text-3xl">{getInitials(provider.businessName)}</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <h1 className="text-2xl font-bold text-text-primary leading-tight">{provider.businessName}</h1>
              {provider.isVerified && (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                  <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {rating > 0 && reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={rating} size={16} readOnly />
                <span className="text-text-secondary text-sm">{rating.toFixed(1)}</span>
                <span className="text-text-light text-sm">({reviewCount} avis)</span>
              </div>
            )}

            {cityLabel && (
              <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {cityLabel}
              </div>
            )}

            {provider.memberSince && (
              <p className="text-text-light text-xs">Membre depuis {formatMemberSince(provider.memberSince)}</p>
            )}
          </div>

          {/* Chips livraison / retrait */}
          {(provider.acceptsDelivery || provider.acceptsPickup) && (
            <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
              {provider.acceptsDelivery && (
                <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold pl-1 pr-3 py-1 rounded-full shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </span>
                  Livraison
                </span>
              )}
              {provider.acceptsPickup && (
                <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold pl-1 pr-3 py-1 rounded-full shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </span>
                  Retrait sur place
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Corps ────────────────────────────────────────────── */}
      <div className="max-w-content mx-auto px-6 flex flex-col gap-8 pt-8">

        {/* Description */}
        {provider.description && (
          <p className="text-text-secondary text-sm leading-relaxed text-center">{provider.description}</p>
        )}

        {/* Adresse + zones de livraison */}
        {(provider.businessAddress || deliveryZones.length > 0) && (
          <div className="flex flex-col gap-3">
            {provider.businessAddress && (
              <div className="flex items-start gap-3 bg-surface-grey rounded-xl px-4 py-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary flex-shrink-0 mt-0.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p className="text-sm text-text-primary">{provider.businessAddress}</p>
              </div>
            )}
            {deliveryZones.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Zones de livraison</p>
                <div className="flex flex-wrap gap-2">
                  {deliveryZones.map((zone, i) => {
                    const label = typeof zone === 'string' ? zone : zone.city
                    return (
                      <span key={`${label}-${i}`} className="bg-primary-surface text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/15">
                        {label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglets Abonnements / Plats */}
        {(subscriptions.length > 0 || meals.length > 0) && (
          <section>
            {showTabs ? (
              <div className="flex border-b border-border -mx-6 px-6 mb-px">
                <button
                  onClick={() => setTabOverride('subscriptions')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'subscriptions' ? 'border-primary text-primary' : 'border-transparent text-text-light'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Abonnements
                  <span className="text-xs font-normal">({subscriptions.length})</span>
                </button>
                <button
                  onClick={() => setTabOverride('meals')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'meals' ? 'border-primary text-primary' : 'border-transparent text-text-light'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 2v7a2 2 0 002 2 2 2 0 002-2V2M5 11v11M9 2v7a2 2 0 01-2 2M19 2v20M19 2a4 4 0 00-4 4v3a2 2 0 002 2h2"/>
                  </svg>
                  Plats
                  <span className="text-xs font-normal">({meals.length})</span>
                </button>
              </div>
            ) : (
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {subscriptions.length > 0 ? 'Abonnements' : 'Plats proposés'}
              </h2>
            )}

            {/* Grille type Instagram */}
            <div className={`grid grid-cols-3 gap-1.5 ${showTabs ? 'mt-4' : ''}`}>
              {activeTab === 'subscriptions' && subscriptions.map((sub) => {
                const image = sub.images?.[0] ?? sub.imageUrl
                return (
                  <Link
                    key={sub.id}
                    href={`/subscriptions/${sub.id}`}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-surface-grey"
                  >
                    {image ? (
                      <Image src={image} alt={sub.name} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-light">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-[11px] font-semibold line-clamp-1">{sub.name}</p>
                      <p className="text-white/85 text-[10px] font-medium">{formatPrice(sub.price, sub.currency)}</p>
                    </div>
                  </Link>
                )
              })}

              {activeTab === 'meals' && meals.map((meal) => {
                const price = mealDisplayPrice(meal)
                return (
                  <Link
                    key={meal.id}
                    href={`/meals/${meal.id}`}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-surface-grey"
                  >
                    {meal.imageUrl ? (
                      <Image src={meal.imageUrl} alt={meal.name} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-light">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                      </div>
                    )}
                    {meal.priceType === 'MULTIPLE' && (
                      <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Variantes</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-[11px] font-semibold line-clamp-1">{meal.name}</p>
                      {price && <p className="text-white/85 text-[10px] font-medium">{price}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Points de retrait */}
        {pickupPoints.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">Points de retrait</h2>
            <div className="flex flex-col gap-2">
              {pickupPoints.map((point) => (
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
        {subscriptions.length === 0 && meals.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-grey flex items-center justify-center text-text-light">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            </div>
            <p className="text-text-secondary text-sm">Ce prestataire n'a pas encore publié de contenu.</p>
          </div>
        )}

        {/* Back */}
        <Link href="/" className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors w-fit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Retour à l'accueil
        </Link>

      </div>
    </div>
  )
}
