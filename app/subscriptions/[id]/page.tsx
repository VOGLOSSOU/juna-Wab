'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getSubscription } from '@/lib/api/subscriptions'
import { getSubscriptionReviews } from '@/lib/api/reviews'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useAuthStore } from '@/lib/store/auth'
import { formatPrice, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS, SUBSCRIPTION_CATEGORY_LABELS, formatDate, timeAgo, getInitials } from '@/lib/utils'
import type { Subscription, Review } from '@/types'

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    Promise.all([
      getSubscription(id),
      getSubscriptionReviews(id),
    ]).then(([sub, rev]) => {
      setSubscription(sub)
      setReviews(rev.items)
    }).catch(() => router.push('/not-found'))
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
          <div className="lg:col-span-3">
            <SkeletonCard />
          </div>
          <div className="lg:col-span-2">
            <SkeletonCard />
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) return null

  const { name, images, price, currency, type, duration, category, description, rating, reviewCount, provider, isActive, meals, deliveryZones, pickupPoints } = subscription

  return (
    <div className="max-w-content mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Colonne gauche */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Carousel images */}
          <div className="flex flex-col gap-3">
            <div className="relative h-72 lg:h-96 rounded-xl overflow-hidden bg-surface-grey">
              {images?.[currentImage] ? (
                <Image src={images[currentImage]} alt={name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-light"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg></div>
              )}
            </div>
            {images && images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
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

            {description && <p className="text-body-medium text-text-secondary leading-relaxed">{description}</p>}
          </div>

          {/* Plats inclus */}
          {meals && meals.length > 0 && (
            <div>
              <h2 className="text-title-large font-semibold mb-4">Repas inclus</h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex-shrink-0 w-36 flex flex-col gap-2">
                    <div className="relative h-24 rounded-lg overflow-hidden bg-surface-grey">
                      {meal.imageUrl ? (
                        <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-light"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg></div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-text-primary line-clamp-2">{meal.name}</p>
                    {meal.description && <p className="text-xs text-text-secondary line-clamp-2">{meal.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avis */}
          <div>
            {(reviewCount ?? 0) > 0 && <h2 className="text-title-large font-semibold mb-4">Avis ({reviewCount})</h2>}
            {(reviewCount ?? 0) === 0 && <h2 className="text-title-large font-semibold mb-4">Avis</h2>}
            {reviews.length === 0 ? (
              <p className="text-text-secondary text-sm">Aucun avis pour le moment — soyez le premier !</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex gap-3 p-4 bg-white rounded-lg border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
                      {review.user?.avatar ? (
                        <Image src={review.user.avatar} alt="" width={40} height={40} className="rounded-full object-cover" />
                      ) : (
                        getInitials(review.user?.name ?? 'U')
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{review.user?.name ?? 'Utilisateur'}</span>
                        <span className="text-xs text-text-light">{timeAgo(review.createdAt)}</span>
                      </div>
                      <StarRating value={review.rating} size={14} readOnly />
                      {review.comment && <p className="text-sm text-text-secondary mt-1">{review.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite sticky */}
        <div className="lg:w-80 flex flex-col gap-4 lg:sticky lg:top-24 self-start">
          {/* Prix & CTA */}
          <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4 shadow-sm">
            <div>
              <span className="text-display-medium font-bold text-primary">{formatPrice(price, currency)}</span>
              <p className="text-sm text-text-secondary mt-1">{SUBSCRIPTION_DURATION_LABELS[duration]}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!isActive}
              onClick={handleSubscribe}
            >
              {isActive ? "S'abonner" : 'Indisponible'}
            </Button>
            {!isActive && (
              <p className="text-xs text-text-secondary text-center">Cet abonnement n&apos;est pas disponible pour le moment.</p>
            )}
          </div>

          {/* Provider */}
          {provider && (
            <div className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3 shadow-sm">
              <h3 className="font-semibold text-sm">Prestataire</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-surface flex items-center justify-center text-primary font-bold">
                  {provider.logo ? (
                    <Image src={provider.logo} alt={provider.name} width={48} height={48} className="rounded-full object-cover" />
                  ) : (
                    getInitials(provider.name)
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-1">
                    {provider.name}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                      <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </p>
                  {provider.rating !== undefined && (provider.reviewCount ?? 0) > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating value={provider.rating} size={12} readOnly />
                      <span className="text-xs text-text-secondary">({provider.reviewCount})</span>
                    </div>
                  )}
                </div>
              </div>
              <Link href={`/providers/${provider.id}`}>
                <Button variant="outline" size="sm" className="w-full">Voir le profil</Button>
              </Link>
            </div>
          )}

          {/* Livraison */}
          {((deliveryZones && deliveryZones.length > 0) || (pickupPoints && pickupPoints.length > 0)) && (
            <div className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3 shadow-sm">
              <h3 className="font-semibold text-sm">Livraison</h3>
               {deliveryZones && deliveryZones.length > 0 && (
                 <div>
                   <p className="text-xs text-text-secondary mb-1.5 font-medium">Zones de livraison</p>
                   <div className="flex flex-wrap gap-1">
                     {deliveryZones.map((zone, i) => (
                       <Badge key={i} variant="outline">{typeof zone === 'string' ? zone : `${(zone as any).city} (${(zone as any).cost} XOF)`}</Badge>
                     ))}
                   </div>
                 </div>
               )}
              {pickupPoints && pickupPoints.length > 0 && (
                <div>
                  <p className="text-xs text-text-secondary mb-1.5 font-medium">Points de retrait</p>
                  <ul className="flex flex-col gap-1">
                    {pickupPoints.map((point, i) => (
                      <li key={i} className="text-xs text-text-primary">{point}</li>
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
