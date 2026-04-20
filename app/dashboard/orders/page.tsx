'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProviderOrders, confirmOrder, markOrderReady } from '@/lib/api/orders'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Order, OrderStatus } from '@/types'

const STATUS_FILTERS = [
  { label: 'Toutes', value: '' },
  { label: 'En attente', value: 'PENDING' },
  { label: 'Confirmées', value: 'CONFIRMED' },
  { label: 'Prêtes', value: 'READY' },
  { label: 'Livrées', value: 'DELIVERED' },
  { label: 'Terminées', value: 'COMPLETED' },
  { label: 'Annulées', value: 'CANCELLED' },
]

export default function DashboardOrdersPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getProviderOrders().then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  const handleConfirm = async (id: string) => {
    setActionLoading(id)
    try {
      const updated = await confirmOrder(id)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: updated.status } : o))
      toast.success('Commande confirmée')
    } catch {
      toast.error('Erreur lors de la confirmation')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReady = async (id: string) => {
    setActionLoading(id)
    try {
      const updated = await markOrderReady(id)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: updated.status } : o))
      toast.success('Commande marquée comme prête')
    } catch {
      toast.error('Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  if (loading) return <div className="p-10 text-center text-text-secondary">Chargement...</div>

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-large font-semibold">Commandes reçues</h1>
        <span className="text-text-secondary text-sm">{orders.length} commande{orders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p>Aucune commande{filter ? ` avec le statut "${ORDER_STATUS_LABELS[filter as OrderStatus]}"` : ''}.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-text-secondary">{order.user?.name ?? '—'}</p>
                <p className="text-xs text-text-light mt-0.5">{order.subscription?.name} • {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">{formatPrice(order.amount ?? order.totalAmount ?? 0, order.currency)}</span>
                {order.status === 'PENDING' && (
                  <Button size="sm" variant="primary" loading={actionLoading === order.id} onClick={() => handleConfirm(order.id)}>
                    Confirmer
                  </Button>
                )}
                {order.status === 'CONFIRMED' && (
                  <Button size="sm" variant="outline" loading={actionLoading === order.id} onClick={() => handleReady(order.id)}>
                    Marquer prêt
                  </Button>
                )}
                <Link href={`/dashboard/orders/${order.id}`}>
                  <Button size="sm" variant="ghost">Détail</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
