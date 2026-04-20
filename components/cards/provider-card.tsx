import Link from 'next/link'
import Image from 'next/image'
import { StarRating } from '@/components/ui/star-rating'
import { getInitials } from '@/lib/utils'
import type { ProviderSummary } from '@/types'

interface ProviderCardProps {
  provider: ProviderSummary
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const { id, name, logo, isVerified, city, rating, reviewCount, subscriptionCount } = provider

  return (
    <Link
      href={`/providers/${id}`}
      className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
    >
      <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-primary-surface flex items-center justify-center">
        {logo ? (
          <Image src={logo} alt={name} fill className="object-cover" />
        ) : (
          <span className="font-bold text-primary text-lg">{getInitials(name)}</span>
        )}
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary text-sm truncate">{name}</h3>
          {isVerified && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A5C2A">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          )}
        </div>

        {city && <p className="text-xs text-text-secondary">{typeof city === 'string' ? city : city}</p>}

        <div className="flex items-center gap-3 mt-1">
          {rating !== undefined && (
            <div className="flex items-center gap-1">
              <StarRating value={rating} size={12} readOnly />
              <span className="text-xs text-text-secondary">({reviewCount ?? 0})</span>
            </div>
          )}
          {subscriptionCount !== undefined && (
            <span className="text-xs text-text-secondary">{subscriptionCount} abonnements</span>
          )}
        </div>
      </div>

      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  )
}
