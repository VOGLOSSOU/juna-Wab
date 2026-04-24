'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProviderActiveSubscriptions } from '@/lib/api/active-subscriptions'
import { formatDate, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ActiveSubscription } from '@/types'

function daysLeft(endsAt: string): number {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

function Skeleton() {
  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-4">
      <div className="h-8 w-64 bg-surface-grey rounded animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-48 bg-white rounded-xl border border-border animate-pulse" />
      ))}
    </div>
  )
}

export default function ProviderActiveSubscriptionsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [subs, setSubs] = useState<ActiveSubscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getProviderActiveSubscriptions()
      .then(setSubs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  if (!hydrated || loading) return <Skeleton />

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-large font-semibold">Abonnés actifs</h1>
          <p className="text-text-secondary text-sm mt-1">{subs.length} abonné{subs.length !== 1 ? 's' : ''} en cours</p>
        </div>
        <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
          ← Tableau de bord
        </Link>
      </div>

      {subs.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-16 flex flex-col items-center gap-3 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-light">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <p className="font-medium text-text-primary">Aucun abonné actif pour le moment</p>
          <p className="text-sm text-text-secondary">Les abonnements démarrent quand vos clients activent leurs commandes.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subs.map((sub) => {
            const remaining = daysLeft(sub.endsAt)
            const isExpiringSoon = remaining <= 3

            return (
              <div key={sub.id} className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">

                {/* Ligne du haut : abonnement + badge jours restants */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-text-primary">{sub.subscription.name}</h2>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="default" className="text-xs">{SUBSCRIPTION_TYPE_LABELS[sub.subscription.type]}</Badge>
                      <Badge variant="grey" className="text-xs">{SUBSCRIPTION_DURATION_LABELS[sub.duration]}</Badge>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isExpiringSoon ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isExpiringSoon ? 'bg-orange-500' : 'bg-green-500'}`} />
                    {remaining === 0 ? 'Expire aujourd\'hui' : `${remaining}j restant${remaining > 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="h-px bg-border" />

                {/* Deux colonnes : abonné + commande */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Infos abonné */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold text-text-light uppercase tracking-widest">Abonné</p>
                    {sub.user ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary-surface flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                            {sub.user.name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-text-primary">{sub.user.name ?? '—'}</p>
                          </div>
                        </div>
                        {sub.user.email && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            {sub.user.email}
                          </div>
                        )}
                        {sub.user.phone && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.23-1.23a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                            </svg>
                            {sub.user.phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">Informations non disponibles</p>
                    )}
                  </div>

                  {/* Infos commande */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold text-text-light uppercase tracking-widest">Commande</p>
                    {sub.order ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-text-secondary">N°</span>
                          <span className="font-mono font-semibold text-text-primary">{sub.order.orderNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          {sub.order.deliveryMethod === 'DELIVERY' ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                              </svg>
                              <span>Livraison{sub.order.deliveryCity ? ` · ${sub.order.deliveryCity}` : ''}</span>
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              <span>Retrait sur place</span>
                            </>
                          )}
                        </div>
                        {sub.order.deliveryAddress && (
                          <p className="text-xs text-text-secondary pl-5">{sub.order.deliveryAddress}</p>
                        )}
                        <Link
                          href={`/dashboard/orders/${sub.orderId}`}
                          className="text-xs text-primary font-medium hover:underline mt-1 self-start"
                        >
                          Voir la commande →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">Informations non disponibles</p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-grey rounded-lg px-3 py-2.5">
                    <p className="text-xs text-text-secondary mb-0.5">Début</p>
                    <p className="text-sm font-medium text-text-primary">{formatDate(sub.startedAt)}</p>
                  </div>
                  <div className="bg-surface-grey rounded-lg px-3 py-2.5">
                    <p className="text-xs text-text-secondary mb-0.5">Fin prévue</p>
                    <p className={`text-sm font-medium ${isExpiringSoon ? 'text-orange-600' : 'text-text-primary'}`}>
                      {formatDate(sub.endsAt)}
                    </p>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
