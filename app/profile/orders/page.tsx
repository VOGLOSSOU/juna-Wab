'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getMyOrders } from '@/lib/api/orders'
import { StatusBadge } from '@/components/ui/status-badge'
import { SkeletonText } from '@/components/ui/skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

export default function OrdersPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getMyOrders().then(setOrders).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  return (
    <div className="max-w-content mx-auto px-6 py-10">
      <h1 className="text-headline-large font-semibold mb-8">Mes commandes</h1>

      {loading ? (
        <div className="flex flex-col gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white p-4 rounded-lg border border-border"><SkeletonText lines={3} /></div>)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <div className="text-text-light mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <p>Aucune commande pour l&apos;instant.</p>
          <Link href="/explorer" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">
            Découvrir des abonnements
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/profile/orders/${order.id}`}
              className="flex items-center gap-4 bg-white rounded-lg border border-border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col gap-1 flex-1">
                <p className="font-semibold text-sm">{order.subscription?.name ?? 'Abonnement'}</p>
                <p className="text-xs text-text-secondary">{order.subscription?.provider?.businessName ?? order.subscription?.provider?.name}</p>
                <p className="text-xs text-text-light">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                <span className="font-semibold text-primary text-sm">{formatPrice(order.amount ?? order.totalAmount ?? 0, order.currency)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
