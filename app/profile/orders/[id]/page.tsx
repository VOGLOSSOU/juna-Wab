/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOrder, activateOrder } from '@/lib/api/orders'
import { getSubscription } from '@/lib/api/subscriptions'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import { showApiError } from '@/lib/utils/api-error'
import type { Order } from '@/types'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuthGuard()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    setLoading(true)
    getOrder(id)
      .then(async (fetched) => {
        if (!fetched.subscription && fetched.subscriptionId) {
          try {
            const sub = await getSubscription(fetched.subscriptionId)
            setOrder({
              ...fetched,
              subscription: {
                id: sub.id,
                name: sub.name,
                provider: sub.provider ? { id: sub.provider.id, name: sub.provider.name } : undefined,
              },
            })
          } catch {
            setOrder(fetched)
          }
        } else {
          setOrder(fetched)
        }
      })
      .catch((err) => showApiError(err))
      .finally(() => setLoading(false))
  }, [id, hydrated, isAuthenticated])

  const handleActivateOrder = async () => {
    if (!order) return
    setActivating(true)
    try {
      await activateOrder(order.id)
      const refreshed = await getOrder(order.id)
      setOrder(refreshed)
      toast.success('Abonnement démarré ! Le paiement vient d\'être transféré au prestataire.')
    } catch (err: unknown) {
      showApiError(err)
    } finally {
      setActivating(false)
    }
  }

  if (loading) return <div className="p-10 text-center text-text-secondary">Chargement...</div>
  if (!order) return null

  const statusFlow = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'] as const
  const currentIndex = statusFlow.indexOf(order.status as typeof statusFlow[number])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-large font-semibold">Commande</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-text-secondary">Abonnement</p>
            <p className="font-semibold">{order.subscription?.name ?? '—'}</p>
            <p className="text-sm text-text-secondary">{order.subscription?.provider?.businessName ?? order.subscription?.provider?.name}</p>
          </div>
          {(order.subscription?.id ?? order.subscriptionId) && (
            <Link href={`/subscriptions/${order.subscription?.id ?? order.subscriptionId}`} className="flex-shrink-0">
              <Button variant="outline" size="sm">Voir l'abonnement</Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary">Date</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Montant</p>
            <p className="font-medium text-primary">{formatPrice(order.amount ?? order.totalAmount ?? 0, order.currency)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Livraison</p>
            <p className="font-medium">{order.deliveryMethod === 'DELIVERY' ? 'À domicile' : 'Retrait sur place'}</p>
          </div>
          <div>
            <p className="text-text-secondary">Paiement</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-green-100 text-green-800'
            }`}>
              {order.status === 'PENDING' ? '⏳ En attente' :
               order.status === 'CANCELLED' ? '✗ Échoué' :
               '✓ Payé'}
            </span>
          </div>
        </div>

        {order.deliveryAddress && (
          <div>
            <p className="text-text-secondary text-sm">Adresse de livraison</p>
            <p className="font-medium text-sm">{order.deliveryAddress}</p>
          </div>
        )}
        {order.pickupLocation && (
          <div>
            <p className="text-text-secondary text-sm">Point de retrait</p>
            <p className="font-medium text-sm">{order.pickupLocation}</p>
          </div>
        )}
        {order.notes && (
          <div>
            <p className="text-text-secondary text-sm">Notes</p>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-semibold mb-4 text-sm">Statut de la commande</h2>
          <div className="flex items-start gap-0">
            {statusFlow.map((status, i) => (
              <div key={status} className="flex items-start flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${i <= currentIndex ? 'bg-primary border-primary' : 'bg-white border-border'}`} />
                  <span className={`text-center leading-tight ${i <= currentIndex ? 'text-primary font-medium' : 'text-text-secondary'}`} style={{ fontSize: '10px' }}>
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                </div>
                {i < statusFlow.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-2 ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton PAYER pour commandes PENDING */}
      {order.status === 'PENDING' && (
        <Button variant="primary" onClick={() => router.push(`/checkout?orderId=${order.id}`)}>
          Payer maintenant
        </Button>
      )}

      {/* Bouton ACTIVER pour commandes CONFIRMED */}
      {order.status === 'CONFIRMED' && (
        <div className="flex flex-col gap-3">
          <div className="bg-primary-surface border border-primary/20 rounded-xl px-4 py-3 text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary block mb-1">À quoi sert ce bouton ?</strong>
            En appuyant sur ce bouton, vous démarrez officiellement votre abonnement à partir d'aujourd'hui.
            C'est à ce moment précis que le paiement est transféré au prestataire — pas avant.
            Cela ne signifie pas que vous avez reçu tous vos repas, mais simplement que votre abonnement est lancé et que le prestataire peut commencer à préparer vos repas.
          </div>
          <Button variant="primary" onClick={handleActivateOrder} loading={activating}>
            Démarrer mon abonnement
          </Button>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <Button variant="primary" onClick={() => router.push(`/reviews/new?orderId=${order.id}&subscriptionId=${order.subscription?.id ?? order.subscriptionId}`)}>
          Laisser un avis
        </Button>
      )}
    </div>
  )
}
