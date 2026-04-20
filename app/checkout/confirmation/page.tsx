'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getOrder } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

export default function CheckoutConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') ?? ''
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    getOrder(orderId).then(setOrder).catch(console.error).finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-grey animate-pulse mx-auto mb-4" />
        <div className="h-6 w-48 bg-surface-grey rounded animate-pulse mx-auto" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center flex flex-col items-center gap-4">
        <p className="text-text-secondary">Commande introuvable.</p>
        <Link href="/profile/orders"><Button variant="primary">Mes commandes</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12 flex flex-col items-center gap-6">
      {/* Icone succès */}
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>

      <div className="text-center">
        <h1 className="text-headline-large font-bold text-primary">Commande créée !</h1>
        <p className="text-text-secondary mt-2">Votre commande a été transmise au prestataire. Vous recevrez une confirmation sous peu.</p>
      </div>

      {/* Détails */}
      <div className="w-full bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Numéro</span>
          <span className="font-semibold text-sm">{order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Statut</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Abonnement</span>
          <span className="font-medium text-sm">{order.subscription?.name ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Montant</span>
          <span className="font-bold text-primary">{formatPrice(order.amount ?? order.totalAmount ?? 0, order.currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Date</span>
          <span className="text-sm">{formatDate(order.createdAt)}</span>
        </div>
        {order.qrCode && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-text-secondary mb-2">Code QR de retrait</p>
            <p className="font-mono font-bold text-center text-primary text-lg tracking-wider">{order.qrCode}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full gap-3">
        <Link href={`/profile/orders/${order.id}`} className="w-full">
          <Button variant="primary" className="w-full">Suivre ma commande</Button>
        </Link>
        <Link href="/explorer" className="w-full">
          <Button variant="outline" className="w-full">Continuer à explorer</Button>
        </Link>
      </div>
    </div>
  )
}
