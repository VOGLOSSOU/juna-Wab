'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProviderProfile } from '@/lib/api/auth'
import toast from 'react-hot-toast'
import type { Provider } from '@/types'

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-48 bg-surface-grey rounded-lg" />
      <div className="h-64 bg-surface-grey rounded-xl" />
    </div>
  )
}

export default function DashboardProfilePage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getProviderProfile()
      .then(setProvider)
      .catch(() => toast.error('Impossible de charger le profil'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  if (!hydrated || loading) return <Skeleton />
  if (!provider) return null

  const statusConfig = {
    APPROVED:  { label: 'Approuvé',   color: 'bg-green-50 text-green-700 border-green-200' },
    PENDING:   { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    REJECTED:  { label: 'Refusé',     color: 'bg-red-50 text-red-700 border-red-200' },
    SUSPENDED: { label: 'Suspendu',   color: 'bg-surface-grey text-text-secondary border-border' },
  }
  const status = statusConfig[provider.status ?? 'PENDING']

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <a href="/dashboard" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-surface-grey transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </a>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Mon profil prestataire</h1>
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border mt-1 ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="bg-primary-surface px-6 py-6 flex items-center gap-4">
          {provider.logo ? (
            <img src={provider.logo} alt={provider.businessName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-text-primary">{provider.businessName}</h2>
            {provider.city && (
              <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {provider.city.name}
              </p>
            )}
            {provider.rating !== undefined && (
              <p className="text-xs text-text-secondary mt-1">⭐ {provider.rating.toFixed(1)} · {provider.totalReviews ?? 0} avis</p>
            )}
          </div>
        </div>

        <div className="divide-y divide-divider">
          {provider.description && (
            <div className="px-6 py-4">
              <p className="text-xs text-text-light mb-1 font-medium uppercase tracking-wide">Description</p>
              <p className="text-sm text-text-primary leading-relaxed">{provider.description}</p>
            </div>
          )}
          {provider.businessAddress && (
            <div className="px-6 py-4">
              <p className="text-xs text-text-light mb-1 font-medium uppercase tracking-wide">Adresse</p>
              <p className="text-sm text-text-primary">{provider.businessAddress}</p>
            </div>
          )}
          <div className="px-6 py-4">
            <p className="text-xs text-text-light mb-2 font-medium uppercase tracking-wide">Services</p>
            <div className="flex gap-2 flex-wrap">
              {provider.acceptsDelivery && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-surface text-primary flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Livraison
                </span>
              )}
              {provider.acceptsPickup && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-surface text-primary flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  Retrait sur place
                </span>
              )}
              {!provider.acceptsDelivery && !provider.acceptsPickup && (
                <span className="text-sm text-text-light">Aucun service défini</span>
              )}
            </div>
          </div>
          {provider.deliveryZones && provider.deliveryZones.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-xs text-text-light mb-2 font-medium uppercase tracking-wide">Zones de livraison</p>
              <div className="flex flex-col gap-1.5">
                {provider.deliveryZones.map((z, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary">{z.city} · {z.country}</span>
                    <span className="font-medium text-primary">{z.cost.toLocaleString('fr-FR')} XOF</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {provider.landmarks && provider.landmarks.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-xs text-text-light mb-2 font-medium uppercase tracking-wide">Points de présence</p>
              <div className="flex flex-wrap gap-2">
                {provider.landmarks.map(({ landmark }) => (
                  <span key={landmark.id} className="text-xs bg-surface-grey text-text-secondary px-3 py-1 rounded-full">{landmark.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
