'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getOrder, confirmOrder, markOrderReady } from '@/lib/api/orders'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Order } from '@/types'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'COMPLETED'] as const

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse flex flex-col gap-6">
      <div className="h-8 w-48 bg-surface-grey rounded" />
      <div className="h-40 bg-surface-grey rounded-xl" />
      <div className="h-40 bg-surface-grey rounded-xl" />
    </div>
  )
}

export default function DashboardOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getOrder(id)
      .then(setOrder)
      .catch(() => router.push('/dashboard/orders'))
      .finally(() => setLoading(false))
  }, [id, hydrated, isAuthenticated, router])

  const handleConfirm = async () => {
    setActionLoading(true)
    try {
      const updated = await confirmOrder(id)
      setOrder(prev => prev ? { ...prev, status: updated.status } : prev)
      toast.success('Commande confirmée')
    } catch {
      toast.error('Erreur lors de la confirmation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReady = async () => {
    setActionLoading(true)
    try {
      const updated = await markOrderReady(id)
      setOrder(prev => prev ? { ...prev, status: updated.status } : prev)
      toast.success('Commande marquée comme prête')
    } catch {
      toast.error('Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  if (!hydrated || loading) return <Skeleton />
  if (!order) return null

  const orderNumber = order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`
  const amount = order.amount ?? order.totalAmount ?? 0
  const stepIndex = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-surface-grey transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Commande {orderNumber}</h1>
          <p className="text-sm text-text-secondary">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Progression */}
      {order.status !== 'CANCELLED' && stepIndex >= 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-semibold text-sm mb-4">Progression</h2>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIndex
              const current = i === stepIndex
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex flex-col items-center gap-1 ${i === STATUS_STEPS.length - 1 ? '' : 'flex-1'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done ? 'bg-primary text-white' : 'bg-surface-grey text-text-light'
                    } ${current ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                      {done && i < stepIndex ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[10px] text-center leading-tight hidden sm:block ${done ? 'text-primary font-medium' : 'text-text-light'}`}>
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-surface-grey'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Infos commande */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Détails de la commande</h2>
        </div>
        <div className="divide-y divide-border">
          <Row label="Abonnement" value={order.subscription?.name ?? '—'} />
          <Row label="Client" value={order.user?.name ?? '—'} />
          <Row label="Montant" value={formatPrice(amount, order.currency)} bold />
          <Row
            label="Livraison"
            value={order.deliveryMethod === 'DELIVERY' ? 'Livraison à domicile' : 'Retrait sur place'}
          />
          {order.deliveryMethod === 'DELIVERY' && order.deliveryAddress && (
            <Row label="Adresse" value={order.deliveryAddress} />
          )}
          {order.deliveryMethod === 'PICKUP' && order.landmark && (
            <Row label="Point de retrait" value={order.landmark.name} />
          )}
          {order.notes && <Row label="Notes" value={order.notes} />}
          {order.paymentMethod && (
            <Row label="Paiement" value={PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} />
          )}
          {order.scheduledFor && (
            <Row label="Planifié pour" value={formatDate(order.scheduledFor)} />
          )}
          {order.completedAt && (
            <Row label="Terminé le" value={formatDate(order.completedAt)} />
          )}
        </div>
      </div>

      {/* QR Code */}
      {order.qrCode && (
        <div className="bg-white rounded-xl border border-border p-5 flex flex-col items-center gap-3">
          <h2 className="font-semibold text-sm self-start">QR Code de livraison</h2>
          <div className="bg-surface-grey rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-2">Présentez ce code à la livraison</p>
            <p className="font-mono text-sm font-bold tracking-widest text-primary">{order.qrCode}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
        <div className="flex gap-3">
          {order.status === 'PENDING' && (
            <Button variant="primary" className="flex-1" loading={actionLoading} onClick={handleConfirm}>
              Confirmer la commande
            </Button>
          )}
          {order.status === 'CONFIRMED' && (
            <Button variant="outline" className="flex-1" loading={actionLoading} onClick={handleReady}>
              Marquer comme prête
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

const PAYMENT_LABELS: Record<string, string> = {
  MOBILE_MONEY_WAVE:   'Wave',
  MOBILE_MONEY_MTN:    'MTN Mobile Money',
  MOBILE_MONEY_MOOV:   'Moov Money',
  MOBILE_MONEY_ORANGE: 'Orange Money',
  CARD:                'Carte bancaire',
  CASH:                'Espèces',
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3">
      <span className="text-xs text-text-secondary whitespace-nowrap">{label}</span>
      <span className={`text-sm text-right ${bold ? 'font-bold text-primary' : 'text-text-primary'}`}>{value}</span>
    </div>
  )
}
