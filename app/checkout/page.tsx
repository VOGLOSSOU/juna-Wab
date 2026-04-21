'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getSubscription } from '@/lib/api/subscriptions'
import { createOrder } from '@/lib/api/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Subscription, DeliveryMethod, PaymentMethod } from '@/types'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'MOBILE_MONEY_WAVE', label: 'Wave' },
  { value: 'MOBILE_MONEY_MTN', label: 'MTN Mobile Money' },
  { value: 'MOBILE_MONEY_MOOV', label: 'Moov Money' },
  { value: 'MOBILE_MONEY_ORANGE', label: 'Orange Money' },
  { value: 'CASH', label: 'Espèces à la livraison' },
]

function CheckoutForm() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscriptionId') ?? ''

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryCity, setDeliveryCity] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOBILE_MONEY_WAVE')
  const [startAsap, setStartAsap] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !subscriptionId) return
    getSubscription(subscriptionId)
      .then(setSubscription)
      .catch(() => router.push('/explorer'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated, subscriptionId, router])

  const handleSubmit = async () => {
    if (deliveryMethod === 'DELIVERY' && (!deliveryAddress || !deliveryCity)) {
      toast.error("Renseignez l'adresse et la ville de livraison")
      return
    }
    setSubmitting(true)
    try {
      const order = await createOrder({
        subscriptionId,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress : undefined,
        deliveryCity: deliveryMethod === 'DELIVERY' ? deliveryCity : undefined,
        startAsap,
        paymentMethod,
      })
      router.push(`/checkout/confirmation?orderId=${order.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(typeof msg === 'string' ? msg : 'Erreur lors de la commande')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated || !isAuthenticated || loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="h-8 w-40 bg-surface-grey rounded animate-pulse mb-6" />
        <div className="h-48 bg-white rounded-xl border border-border animate-pulse" />
      </div>
    )
  }

  if (!subscription) return null

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
      <h1 className="text-headline-large font-semibold">Commander</h1>

      {/* Récap abonnement */}
      <div className="bg-white rounded-xl border border-border p-5 flex gap-4">
        <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-grey">
          {(subscription.imageUrl ?? subscription.images?.[0]) ? (
            <Image src={subscription.imageUrl ?? subscription.images![0]} alt={subscription.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-light">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{subscription.name}</h2>
          <p className="text-xs text-text-secondary mt-0.5">{subscription.provider?.name}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="default" className="text-xs">{SUBSCRIPTION_TYPE_LABELS[subscription.type]}</Badge>
            <Badge variant="grey" className="text-xs">{SUBSCRIPTION_DURATION_LABELS[subscription.duration]}</Badge>
          </div>
          <p className="font-bold text-primary mt-2">{formatPrice(subscription.price, subscription.currency)}</p>
        </div>
      </div>

      {/* Mode de livraison */}
      <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
        <h2 className="font-semibold">Mode de livraison</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'DELIVERY' as DeliveryMethod, label: 'Livraison à domicile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
            { value: 'PICKUP' as DeliveryMethod, label: 'Retrait sur place', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setDeliveryMethod(opt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors text-sm font-medium ${
                deliveryMethod === opt.value ? 'border-primary bg-primary-surface text-primary' : 'border-border text-text-secondary hover:border-primary/40'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        {deliveryMethod === 'DELIVERY' && (
          <div className="flex flex-col gap-3 pt-1">
            <Input
              label="Adresse de livraison *"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              placeholder="Ex : Rue 234, Quartier Cadjehoun"
            />
            <Input
              label="Ville *"
              value={deliveryCity}
              onChange={e => setDeliveryCity(e.target.value)}
              placeholder="Ex : Cotonou"
            />
          </div>
        )}
      </div>

      {/* Date de début */}
      <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
        <h2 className="font-semibold">Date de début</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={startAsap} onChange={e => setStartAsap(e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="text-sm">Démarrer dès que possible</span>
        </label>
        {!startAsap && (
          <Input
            label="Date souhaitée"
            type="datetime-local"
            onChange={e => setStartAsap(false)}
          />
        )}
      </div>

      {/* Paiement */}
      <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
        <h2 className="font-semibold">Méthode de paiement</h2>
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map(pm => (
            <label key={pm.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === pm.value ? 'border-primary bg-primary-surface' : 'border-border hover:border-primary/40'}`}>
              <input
                type="radio"
                name="payment"
                value={pm.value}
                checked={paymentMethod === pm.value}
                onChange={() => setPaymentMethod(pm.value)}
                className="accent-primary"
              />
              <span className="text-sm font-medium">{pm.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Total & CTA */}
      <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Abonnement</span>
          <span className="font-medium">{formatPrice(subscription.price, subscription.currency)}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary text-xl">{formatPrice(subscription.price, subscription.currency)}</span>
        </div>
        <p className="text-xs text-text-secondary">Les frais de livraison seront calculés à la confirmation de commande.</p>
        <Button variant="primary" size="lg" className="w-full" onClick={handleSubmit} loading={submitting}>
          Confirmer la commande
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  )
}
