import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { formatPrice, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'
import type { Subscription } from '@/types'

interface SubscriptionCardProps {
  subscription: Subscription
  variant?: 'compact' | 'featured' | 'horizontal'
}

export function SubscriptionCard({ subscription, variant = 'compact' }: SubscriptionCardProps) {
  const {
    id, name, images, price, currency, type, duration, rating, reviewCount, provider, isActive,
  } = subscription

  const imageUrl = images?.[0]

  if (variant === 'horizontal') {
    return (
      <Link href={`/subscriptions/${id}`} className="flex gap-4 bg-white rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-surface-grey">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-light"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg></div>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-sm line-clamp-1">{name}</h3>
          {provider && <p className="text-xs text-text-secondary line-clamp-1">{provider.name}</p>}
          <div className="flex items-center gap-1 mt-auto">
            <span className="font-bold text-primary text-sm">{formatPrice(price, currency)}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/subscriptions/${id}`}
      className={`group flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-all duration-200 ${
        variant === 'featured' ? 'min-w-[280px]' : ''
      }`}
    >
      <div className={`relative overflow-hidden bg-surface-grey ${variant === 'featured' ? 'h-52' : 'h-44'}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-light"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg></div>
        )}
        {!isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="grey" className="text-white bg-black/60">Indisponible</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-snug">{name}</h3>

        {provider && (
          <p className="text-xs text-text-secondary line-clamp-1">{provider.name}</p>
        )}

        <div className="flex flex-wrap gap-1">
          <Badge variant="default" className="text-xs">{SUBSCRIPTION_TYPE_LABELS[type]}</Badge>
          <Badge variant="grey" className="text-xs">{SUBSCRIPTION_DURATION_LABELS[duration]}</Badge>
        </div>

        {rating !== undefined && reviewCount !== undefined && (
          <div className="flex items-center gap-1">
            <StarRating value={rating} size={14} readOnly />
            <span className="text-xs text-text-secondary">({reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-primary">{formatPrice(price, currency)}</span>
        </div>
      </div>
    </Link>
  )
}
