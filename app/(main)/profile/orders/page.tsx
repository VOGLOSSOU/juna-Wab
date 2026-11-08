'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { useAuthStore } from '@/lib/store/auth'
import { getMyOrders, getOrder, activateOrder } from '@/lib/api/orders'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { showApiError } from '@/lib/utils/api-error'
import type { Order } from '@/types'
import { hasUnresolvedPayment } from '@/lib/utils/payment'

function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-white p-5" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-surface-grey" />
          <div className="h-3 w-1/2 rounded bg-surface-grey" />
        </div>
        <div className="h-6 w-20 rounded-full bg-surface-grey" />
      </div>
      <div className="my-5 space-y-3">
        <div className="h-3 w-2/3 rounded bg-surface-grey" />
        <div className="h-3 w-1/3 rounded bg-surface-grey" />
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="h-5 w-24 rounded bg-surface-grey" />
        <div className="h-10 w-28 rounded-lg bg-surface-grey" />
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activatingOrderId, setActivatingOrderId] = useState<string | null>(null)

  const isProvider = user?.role === 'PROVIDER'

  useEffect(() => {
    if (!hydrated || !isAuthenticated || isProvider) return
    let current = true
    let sequence = 0
    setOrders([])
    setLoading(true)
    const load = async () => {
      if (document.visibilityState === 'hidden') return
      const request = ++sequence
      try {
        const fresh = await getMyOrders()
        if (current && request === sequence) setOrders(fresh)
      } catch (error) { if (current && request === sequence) showApiError(error) }
      finally { if (current && request === sequence) setLoading(false) }
    }
    void load()
    const resume = () => { void load() }
    window.addEventListener('focus', resume)
    document.addEventListener('visibilitychange', resume)
    return () => { current = false; window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', resume) }
  }, [hydrated, isAuthenticated, isProvider, user?.id])


  const handleActivateOrder = async (orderId: string) => {
    setActivatingOrderId(orderId)
    try {
      await activateOrder(orderId)
      const updatedOrder = await getOrder(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o))
      toast.success('Commande activée avec succès !')
    } catch (err: unknown) {
      showApiError(err)
    } finally {
      setActivatingOrderId(null)
    }
  }

  if (!hydrated || !isAuthenticated) return <p className="p-10 text-center">Chargement...</p>

  if (isProvider) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-grey transition-colors text-text-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold">Mes commandes</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Compte prestataire</p>
            <p className="text-sm text-text-secondary mt-1 max-w-xs">
              En tant que prestataire, vous ne pouvez pas passer de commandes. Gérez vos offres depuis votre dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-light transition-colors"
          >
            Aller au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-10">

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

      {/* Cartes de commande : identité, informations, puis montant et action. */}
      {!loading && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const name = order.subscription?.name ?? 'Abonnement'
            const provider = order.subscription?.provider?.businessName ?? order.subscription?.provider?.name
            const delivery = order.deliveryMethod === 'DELIVERY'
            const location = delivery
              ? order.deliveryAddress || order.deliveryCity || 'Livraison à domicile'
              : order.pickupLocation || 'Retrait sur place'
            const detailUrl = `/profile/orders/${order.id}`
            return (
              <article key={order.id} className="relative rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
                <Link href={detailUrl} aria-label={`Voir la commande ${order.orderNumber || name}`}
                  className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" />
                <div className="pointer-events-none relative">
                  <div className="flex items-start justify-between gap-3 px-5 pt-5">
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 break-words text-base font-semibold leading-snug text-text-primary" title={name}>{name}</h2>
                      {provider && <p className="mt-1 break-words text-sm text-text-secondary">{provider}</p>}
                    </div>
                    <div className="shrink-0"><StatusBadge status={order.status} /></div>
                  </div>

                  <div className="space-y-2.5 px-5 py-4 text-sm text-text-secondary">
                    <div className="flex items-start gap-2">
                      <svg aria-hidden="true" className="mt-0.5 shrink-0 text-primary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        {delivery ? <><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7"/><circle cx="7.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></>
                          : <><path d="M3 10h18l-2-6H5l-2 6zM5 10v10h14V10M9 20v-6h6v6"/></>}
                      </svg>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-light">{delivery ? 'Livraison' : 'Retrait sur place'}</p>
                        <p className="mt-0.5 break-words">{location}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <p className="flex min-w-0 items-start gap-2">
                        <svg aria-hidden="true" className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 9h16M3 15h16M10 3l-2 18M16 3l-2 18"/></svg>
                        <span className="break-all" aria-label="Référence de commande">{order.orderNumber || order.id}</span>
                      </p>
                      <time dateTime={order.createdAt} className="text-xs text-text-light">{formatDate(order.createdAt)}</time>
                    </div>
                  </div>

                  <div className="mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-border py-4">
                    <p className="text-lg font-bold text-accent">{formatPrice(order.amount ?? order.totalAmount ?? 0, order.currency)}</p>
                    <div className="pointer-events-auto relative flex flex-wrap items-center gap-3">
                      {order.status === 'PENDING' && (
                        <Link href={`/checkout?orderId=${order.id}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                          {hasUnresolvedPayment(order) ? 'Vérifier le paiement' : 'Payer'}
                        </Link>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <Button variant="primary" className="min-h-10" onClick={() => handleActivateOrder(order.id)} loading={activatingOrderId === order.id}>Activer</Button>
                      )}
                      <Link href={detailUrl} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={`Voir le détail de la commande ${order.orderNumber || name}`}>
                        Voir <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
