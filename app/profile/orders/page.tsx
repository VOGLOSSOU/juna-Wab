'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getMyOrders } from '@/lib/api/orders'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

function OrderSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-surface-grey flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 bg-surface-grey rounded w-2/3" />
        <div className="h-3 bg-surface-grey rounded w-1/3" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-5 w-20 bg-surface-grey rounded-full" />
        <div className="h-3.5 w-16 bg-surface-grey rounded" />
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getMyOrders().then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/profile"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-grey transition-colors text-text-secondary"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold">Mes commandes</h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <OrderSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-grey flex items-center justify-center text-text-light">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-text-primary">Aucune commande</p>
            <p className="text-sm text-text-secondary mt-1">Vous n&apos;avez pas encore passé de commande.</p>
          </div>
          <Link
            href="/explorer"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-light transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Découvrir des abonnements
          </Link>
        </div>
      )}

      {/* Liste */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/profile/orders/${order.id}`}
              className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm hover:border-primary/20 transition-all"
            >
              {/* Icone */}
              <div className="w-10 h-10 rounded-lg bg-primary-surface flex items-center justify-center flex-shrink-0 text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary truncate">
                  {order.subscription?.name ?? 'Abonnement'}
                </p>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {order.subscription?.provider?.businessName ?? order.subscription?.provider?.name ?? '—'}
                </p>
                <p className="text-xs text-text-light mt-0.5">{formatDate(order.createdAt)}</p>
              </div>

              {/* Statut + prix */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <StatusBadge status={order.status} />
                <span className="font-semibold text-sm text-primary">
                  {formatPrice(order.amount ?? order.totalAmount ?? 0, order.currency)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
