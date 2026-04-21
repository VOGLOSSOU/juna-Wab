import Image from 'next/image'
import { StarRating } from '@/components/ui/star-rating'
import { getInitials } from '@/lib/utils'
import type { ProviderSummary } from '@/types'

interface ProviderCardProps {
  provider: ProviderSummary
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const { name, logo, isVerified, city, rating, reviewCount, subscriptionCount } = provider

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-border">
      <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-primary-surface flex items-center justify-center">
        {logo ? (
          <Image src={logo} alt={name} fill sizes="56px" className="object-cover" />
        ) : (
          <span className="font-bold text-primary text-lg">{getInitials(name)}</span>
        )}
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary text-sm truncate">{name}</h3>
          {isVerified && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
              <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {city && <p className="text-xs text-text-secondary">{typeof city === 'string' ? city : city.name}</p>}

        <div className="flex items-center gap-3 mt-1">
          {rating !== undefined && (reviewCount ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <StarRating value={rating} size={12} readOnly />
              <span className="text-xs text-text-secondary">({reviewCount})</span>
            </div>
          )}
          {subscriptionCount !== undefined && (
            <span className="text-xs text-text-secondary">{subscriptionCount} abonnements</span>
          )}
        </div>
      </div>
    </div>
  )
}
