'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSubscription } from '@/lib/api/subscriptions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { SubscriptionCard } from '@/components/cards/subscription-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useAuthStore } from '@/lib/store/auth'
import { formatPrice, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS, SUBSCRIPTION_CATEGORY_LABELS, getInitials } from '@/lib/utils'
import type { Subscription } from '@/types'

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    getSubscription(id)
      .then(setSubscription)
      .catch(() => router.push('/not-found'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/checkout?subscriptionId=${id}`)
    } else {
      router.push(`/checkout?subscriptionId=${id}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3"><SkeletonCard /></div>
          <div className="lg:col-span-2"><SkeletonCard /></div>
        </div>
      </div>
    )
  }

  if (!subscription) return null

  const {
    name, images, price, currency, type, duration, category,
    description, rating, reviewCount, provider, isActive,
    meals, deliveryZones, pickupPoints, providerSubscriptions,
  } = subscription

  const providerCity = provider?.city
    ? (typeof provider.city === 'string' ? provider.city : provider.city.name)
    : null

  return (
    <div className="max-w-content mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Colonne gauche ── */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Carousel images */}
          <div className="flex flex-col gap-3">
            <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden bg-surface-grey">
              {images?.[currentImage] ? (
                <Image src={images[currentImage]} alt={name} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-light">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                </div>
              )}
            </div>
            {images && images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-headline-large font-semibold">{name}</h1>
              <Badge variant={isActive ? 'success' : 'grey'}>
                {isActive ? 'Disponible' : 'Indisponible'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{SUBSCRIPTION_TYPE_LABELS[type]}</Badge>
              <Badge variant="grey">{SUBSCRIPTION_DURATION_LABELS[duration]}</Badge>
              <Badge variant="grey">{SUBSCRIPTION_CATEGORY_LABELS[category]}</Badge>
            </div>

            {rating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={rating} size={18} readOnly />
                <span className="text-text-secondary text-sm">({reviewCount} avis)</span>
              </div>
            )}

            {description && (
              <p className="text-body-medium text-text-secondary leading-relaxed">{description}</p>
            )}
          </div>

          {/* Plats inclus */}
          {meals && meals.length > 0 && (
            <div>
              <h2 className="text-title-large font-semibold mb-4">
                Repas inclus
                <span className="ml-2 text-sm font-normal text-text-secondary">({meals.length})</span>
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex-shrink-0 w-36 flex flex-col gap-2">
                    <div className="relative h-24 rounded-xl overflow-hidden bg-surface-grey">
                      {meal.imageUrl ? (
                        <Image src={meal.imageUrl} alt={meal.name} fill sizes="144px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-light">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-text-primary line-clamp-2">{meal.name}</p>
                    {meal.description && (
                      <p className="text-xs text-text-secondary line-clamp-2">{meal.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Autres abonnements du prestataire */}
          {providerSubscriptions && providerSubscriptions.length > 0 && (
            <div>
              <h2 className="text-title-large font-semibold mb-4">
                Autres offres de {provider?.name}
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {providerSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex-shrink-0 w-48 h-[268px]">
                    <SubscriptionCard subscription={sub} variant="compact" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite sticky ── */}
        <div className="lg:w-80 flex flex-col gap-4 lg:sticky lg:top-24 self-start w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">

          {/* Prix & CTA */}
          <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4 shadow-sm">
            <div>
              <span className="text-display-medium font-bold text-primary">{formatPrice(price, currency)}</span>
              <p className="text-sm text-text-secondary mt-1">{SUBSCRIPTION_DURATION_LABELS[duration]}</p>
            </div>
            <Button variant="primary" size="lg" className="w-full" disabled={!isActive} onClick={handleSubscribe}>
              {isActive ? "S'abonner" : 'Indisponible'}
            </Button>
            {!isActive && (
              <p className="text-xs text-text-secondary text-center">
                Cet abonnement n&apos;est pas disponible pour le moment.
              </p>
            )}
          </div>

          {/* Provider */}
          {provider && (
            <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4 shadow-sm">
                <p className="text-[10px] font-bold text-text-light uppercase tracking-widest">Prestataire</p>

                {/* Avatar + nom + rating */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary-surface flex items-center justify-center text-primary font-bold text-base flex-shrink-0 overflow-hidden">
                    {provider.logo ? (
                      <Image src={provider.logo} alt={provider.name} width={56} height={56} className="rounded-2xl object-cover" />
                    ) : (
                      getInitials(provider.name)
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-text-primary text-sm leading-tight truncate">{provider.name}</span>
                      {provider.isVerified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                          <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {provider.rating !== undefined && (provider.reviewCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating value={provider.rating} size={12} readOnly />
                        <span className="text-xs text-text-secondary">({provider.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {provider.description && (
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {provider.description}
                  </p>
                )}

                {/* Localisation */}
                {(providerCity || provider.businessAddress) && (
                  <div className="flex items-start gap-2 bg-surface-grey rounded-xl px-3 py-2.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-primary">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-xs text-text-secondary">
                      {[provider.businessAddress, providerCity].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Modes de réception */}
                {(provider.acceptsDelivery || provider.acceptsPickup) && (
                  <div className="flex flex-wrap gap-2">
                    {provider.acceptsDelivery && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary-surface text-primary border border-primary/20">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                        Livraison
                      </span>
                    )}
                    {provider.acceptsPickup && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary-surface text-primary border border-primary/20">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        </svg>
                        Retrait sur place
                      </span>
                    )}
                  </div>
                )}
            </div>
          )}

          {/* Zones & points de retrait */}
          {((deliveryZones && deliveryZones.length > 0) || (pickupPoints && pickupPoints.length > 0)) && (
            <div className="bg-white rounded-2xl border border-border p-4 flex flex-col gap-3 shadow-sm">
              <h3 className="font-semibold text-sm">Détails de livraison</h3>
              {deliveryZones && deliveryZones.length > 0 && (
                <div>
                  <p className="text-xs text-text-secondary mb-1.5 font-medium">Zones desservies</p>
                  <div className="flex flex-wrap gap-1">
                    {deliveryZones.map((zone, i) => (
                      <Badge key={i} variant="outline">
                        {typeof zone === 'string' ? zone : `${(zone as any).city} (${(zone as any).cost} XOF)`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {pickupPoints && pickupPoints.length > 0 && (
                <div>
                  <p className="text-xs text-text-secondary mb-1.5 font-medium">Points de retrait</p>
                  <ul className="flex flex-col gap-1">
                    {pickupPoints.map((point, i) => (
                      <li key={i} className="text-xs text-text-primary flex items-start gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
