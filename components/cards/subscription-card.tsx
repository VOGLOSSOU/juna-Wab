'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { formatPrice, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'
import type { Subscription } from '@/types'

interface SubscriptionCardProps {
  subscription: Subscription
  showFavorite?: boolean
  variant?: 'compact' | 'featured' | 'horizontal' | 'explorer'
}

export function SubscriptionCard({ subscription: sub, variant = 'compact', showFavorite = true }: SubscriptionCardProps) {
  const imageUrl = sub.images?.[0] ?? sub.imageUrl
  const unavailable = sub.isAvailable === false || sub.isActive === false || sub.isPublic === false
  const reviews = sub.reviewCount ?? sub.totalReviews ?? 0
  const horizontal = variant === 'horizontal'
  const explorer = variant === 'explorer'
  return (
    <article className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#e8ece6] bg-white shadow-[0_4px_18px_rgba(26,92,42,0.04)] transition-shadow hover:shadow-md ${variant === 'featured' ? 'min-w-[280px]' : ''}`}>
      <Link href={`/subscriptions/${sub.id}`} aria-label={`Voir ${sub.name}`}
        aria-disabled={unavailable || undefined} tabIndex={unavailable ? -1 : undefined}
        onClick={event => { if (unavailable) event.preventDefault() }}
        className={`flex h-full flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${horizontal ? 'flex-row' : 'flex-col'}`}>
        <div className={`relative shrink-0 overflow-hidden bg-primary-surface ${horizontal ? 'w-32 min-h-40' : variant === 'featured' ? 'aspect-[16/10]' : explorer ? 'aspect-[16/10] w-full' : 'aspect-[4/3]'}`}>
          {imageUrl ? <Image src={imageUrl} alt={sub.name} fill
            sizes={horizontal ? '128px' : '(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 25vw'}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none" /> :
            <div className="flex h-full min-h-32 items-center justify-center text-primary/50"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 3v6a3 3 0 006 0V3M7 3v18M19 3c-3 2-4 5-4 8h4m0-8v18" /></svg></div>}
          <span className={`absolute left-3 top-3 max-w-[calc(100%-72px)] truncate rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold leading-tight text-primary shadow-sm ${horizontal ? 'max-w-[calc(100%-24px)]' : ''}`}>
            {SUBSCRIPTION_DURATION_LABELS[sub.duration]}
          </span>
          {unavailable && <span className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-medium text-white">Indisponible</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-3.5">
          <h3 className={`line-clamp-2 text-[15px] font-bold leading-snug text-text-primary [overflow-wrap:anywhere] ${explorer ? 'min-h-[2.75em]' : ''}`}>{sub.name}</h3>
          {sub.provider && <div className={`mt-1.5 flex min-w-0 items-start gap-1 ${explorer ? 'min-h-[3em] text-xs' : ''}`}>
            <p className="line-clamp-2 min-w-0 text-xs leading-relaxed text-text-secondary [overflow-wrap:anywhere]">{sub.provider.name}</p>
            {sub.provider.isVerified && <svg width="14" height="14" viewBox="0 0 24 24" className="mt-0.5 shrink-0" aria-label="Prestataire vérifié"><circle cx="12" cy="12" r="10" fill="#3B82F6" /><path d="m8 12 3 3 5-6" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>}
          {reviews > 0 && sub.rating !== undefined && <div className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
            <span aria-hidden="true" className="text-amber-500">★</span><span className="font-semibold text-text-primary">{sub.rating.toFixed(1)}</span><span>({reviews} avis)</span>
          </div>}
          {explorer && <div className="h-3 shrink-0" />}
          <div className={`${explorer ? 'mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3' : 'mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-3'} border-t border-divider`}>
            <span className="whitespace-nowrap text-lg font-extrabold leading-tight text-accent tabular-nums">{formatPrice(sub.price, sub.currency)}</span>
            <span className={`text-right text-[10px] leading-tight text-text-secondary ${explorer ? 'ml-auto max-w-20' : ''}`}>pour toute la durée</span>
          </div>
        </div>
      </Link>
      {showFavorite && <div className={`absolute right-2 top-2 ${horizontal ? 'right-3' : ''}`}><FavoriteButton subscription={sub} /></div>}
    </article>
  )
}
