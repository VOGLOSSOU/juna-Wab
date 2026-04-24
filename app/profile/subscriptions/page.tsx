'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getMyActiveSubscriptions } from '@/lib/api/active-subscriptions'
import { SubscriberCard } from '@/components/cards/subscriber-card'
import type { ActiveSubscription } from '@/types'

function daysLeft(endsAt: string): number {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000))
}

function Skeleton() {
  return (
    <div className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="h-8 w-56 bg-surface-grey rounded animate-pulse" />
      <div className="h-[520px] bg-surface-grey rounded-3xl animate-pulse" />
    </div>
  )
}

export default function ActiveSubscriptionsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const [subs, setSubs] = useState<ActiveSubscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getMyActiveSubscriptions()
      .then(setSubs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  if (!hydrated || loading) return <Skeleton />

  return (
    <div className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-large font-semibold">Mes abonnements actifs</h1>
        <span className="text-sm text-text-secondary">{subs.length} actif{subs.length !== 1 ? 's' : ''}</span>
      </div>

      {subs.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center gap-3 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-light">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <p className="font-medium text-text-primary">Aucun abonnement actif</p>
          <p className="text-sm text-text-secondary">Activez une commande confirmée pour démarrer un abonnement.</p>
          <Link href="/profile/orders" className="text-primary text-sm font-medium hover:underline mt-1">
            Voir mes commandes →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {subs.map((sub) => (
            <div key={sub.id} className="flex flex-col gap-4">
              <SubscriberCard sub={sub} daysLeft={daysLeft(sub.endsAt)} />
              <Link
                href={`/profile/orders/${sub.orderId}`}
                className="text-center text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Voir la commande associée →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
