'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getSubscription } from '@/lib/api/subscriptions'
import { createOrder } from '@/lib/api/orders'
import { initiatePayment, getPaymentStatus } from '@/lib/api/payments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Subscription, DeliveryMethod, PaymentMethod } from '@/types'

type Step = 'form' | 'payment' | 'processing' | 'failed'

type DeliveryZone = { city: string; country?: string; cost: number }

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'MOBILE_MONEY_MTN', label: 'MTN Mobile Money' },
  { value: 'MOBILE_MONEY_MOOV', label: 'Moov Money' },
  { value: 'MOBILE_MONEY_ORANGE', label: 'Orange Money' },
  { value: 'MOBILE_MONEY_WAVE', label: 'Wave' },
  { value: 'CASH', label: 'Espèces à la livraison' },
]

const POLL_INTERVAL = 5000
const MAX_WAIT = 180000

const COUNTRIES = [
  { prefix: '229', label: 'Bénin', code: 'BEN' },
  { prefix: '225', label: "Côte d'Ivoire", code: 'CIV' },
  { prefix: '221', label: 'Sénégal', code: 'SEN' },
]

const PAWAPAY_PROVIDER: Partial<Record<PaymentMethod, Partial<Record<string, string>>>> = {
  MOBILE_MONEY_MTN:    { BEN: 'MTN_MOMO_BEN', CIV: 'MTN_MOMO_CIV', SEN: 'MTN_MOMO_SEN' },
  MOBILE_MONEY_MOOV:   { BEN: 'MOOV_BEN',     CIV: 'MOOV_CIV' },
  MOBILE_MONEY_ORANGE: { CIV: 'ORANGE_CIV',   SEN: 'ORANGE_SEN' },
}

function getPawapayProvider(method: PaymentMethod, countryCode: string): string | undefined {
  return PAWAPAY_PROVIDER[method]?.[countryCode]
}

function parseZones(raw: unknown[]): DeliveryZone[] {
  return raw.map(z =>
    typeof z === 'string'
      ? { city: z, cost: 0 }
      : (z as DeliveryZone)
  )
}

function CheckoutForm() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscriptionId') ?? ''

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<Step>('form')

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY')
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOBILE_MONEY_MTN')
  const [startAsap, setStartAsap] = useState(true)

  const [orderId, setOrderId] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [localNumber, setLocalNumber] = useState('')
  const [countryCode, setCountryCode] = useState('BEN')
  const [failedMessage, setFailedMessage] = useState('')

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollStartRef = useRef<number>(0)

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !subscriptionId) return
    getSubscription(subscriptionId)
      .then(setSubscription)
      .catch(() => router.push('/explorer'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated, subscriptionId, router])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  useEffect(() => {
    if (step !== 'processing' || !paymentId) return

    pollStartRef.current = Date.now()

    const poll = async () => {
      if (Date.now() - pollStartRef.current >= MAX_WAIT) {
        setFailedMessage('Le paiement prend plus de temps que prévu. Vérifiez votre historique de transactions.')
        setStep('failed')
        return
      }
      try {
        const status = await getPaymentStatus(paymentId)
        if (status.status === 'SUCCESS') {
          router.push(`/checkout/confirmation?orderId=${status.orderId}`)
          return
        }
        if (status.status === 'FAILED') {
          setFailedMessage('Le paiement a échoué. Vérifiez votre solde et réessayez.')
          setStep('failed')
          return
        }
      } catch {
        // continue polling on network error
      }
      pollingRef.current = setTimeout(poll, POLL_INTERVAL)
    }

    pollingRef.current = setTimeout(poll, POLL_INTERVAL)
    return () => { if (pollingRef.current) clearTimeout(pollingRef.current) }
  }, [step, paymentId, router])

  const country = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0]
  const fullPhoneNumber = country.prefix + localNumber.replace(/\s/g, '')

  const deliveryZones = subscription?.deliveryZones ? parseZones(subscription.deliveryZones as unknown[]) : []
  const deliveryCost = deliveryMethod === 'DELIVERY' ? (selectedZone?.cost ?? 0) : 0
  const total = (subscription?.price ?? 0) + deliveryCost

  const handleSubmit = async () => {
    if (deliveryMethod === 'DELIVERY') {
      if (!selectedZone) {
        toast.error('Choisissez une ville de livraison')
        return
      }
      if (!deliveryAddress.trim()) {
        toast.error("Renseignez votre adresse précise")
        return
      }
    }
    setSubmitting(true)
    try {
      const order = await createOrder({
        subscriptionId,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        deliveryCity: deliveryMethod === 'DELIVERY' ? selectedZone!.city : undefined,
        startAsap,
      })

      if (paymentMethod === 'CASH') {
        router.push(`/checkout/confirmation?orderId=${order.id}`)
        return
      }

      setOrderId(order.id)
      setStep('payment')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      const text = Array.isArray(msg) ? msg[0] : msg
      toast.error(typeof text === 'string' ? text : 'Erreur lors de la commande')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInitiatePayment = async () => {
    if (!localNumber.trim()) {
      toast.error('Renseignez votre numéro Mobile Money')
      return
    }
    setSubmitting(true)
    try {
      const provider = getPawapayProvider(paymentMethod, countryCode)
      const result = await initiatePayment({ orderId, phoneNumber: fullPhoneNumber, provider })
      setPaymentId(result.paymentId)
      setStep('processing')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      const text = Array.isArray(msg) ? msg[0] : msg
      toast.error(typeof text === 'string' ? text : "Erreur lors de l'initiation du paiement")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = async () => {
    if (!localNumber.trim()) {
      setStep('payment')
      return
    }
    setSubmitting(true)
    try {
      const provider = getPawapayProvider(paymentMethod, countryCode)
      const result = await initiatePayment({ orderId, phoneNumber: fullPhoneNumber, provider })
      setPaymentId(result.paymentId)
      setStep('processing')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      const text = Array.isArray(msg) ? msg[0] : msg
      toast.error(typeof text === 'string' ? text : 'Erreur lors du paiement')
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

  /* ── Processing screen ── */
  if (step === 'processing') {
    return (
      <div className="max-w-md mx-auto px-6 py-20 flex flex-col items-center gap-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-surface flex items-center justify-center">
          <svg className="animate-spin text-primary" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-title-large font-semibold">Validation en cours…</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Une demande de confirmation a été envoyée sur votre téléphone.<br />
            Saisissez votre code PIN Mobile Money pour valider le paiement.
          </p>
        </div>
        <div className="bg-surface-grey rounded-xl px-4 py-3 flex flex-col gap-1 w-full">
          <p className="text-xs text-text-secondary">Montant à payer</p>
          <p className="font-bold text-primary text-xl">{formatPrice(total, subscription.currency)}</p>
          <p className="text-xs text-text-secondary mt-0.5">+{fullPhoneNumber}</p>
        </div>
        <button
          onClick={() => router.push('/profile/orders')}
          className="text-sm text-text-secondary underline underline-offset-2 hover:text-text-primary transition-colors"
        >
          Voir mes commandes
        </button>
      </div>
    )
  }

  /* ── Failed screen ── */
  if (step === 'failed') {
    return (
      <div className="max-w-md mx-auto px-6 py-20 flex flex-col items-center gap-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-title-large font-semibold">Paiement échoué</h2>
          <p className="text-text-secondary text-sm leading-relaxed">{failedMessage}</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" size="lg" className="w-full" onClick={handleRetry} loading={submitting}>
            Réessayer
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => router.push('/profile/orders')}>
            Voir mes commandes
          </Button>
        </div>
      </div>
    )
  }

  /* ── Phone number step ── */
  if (step === 'payment') {
    return (
      <div className="max-w-md mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-large font-semibold">Payer par Mobile Money</h1>
          <p className="text-text-secondary text-sm">Entrez le numéro associé à votre compte Mobile Money.</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 flex gap-4">
          <div className="relative w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-surface-grey">
            {(subscription.imageUrl ?? subscription.images?.[0]) ? (
              <Image src={subscription.imageUrl ?? subscription.images![0]} alt={subscription.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-light">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{subscription.name}</p>
            <p className="text-xs text-text-secondary mt-0.5">{subscription.provider?.name}</p>
            <p className="font-bold text-primary mt-1">{formatPrice(total, subscription.currency)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
          {/* Country selector */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-text-primary">Pays *</p>
            <div className="flex gap-2">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => setCountryCode(c.code)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-medium transition-colors ${
                    countryCode === c.code
                      ? 'border-primary bg-primary-surface text-primary'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  }`}
                >
                  +{c.prefix}<br />
                  <span className="font-normal">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone number */}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-text-primary">Numéro Mobile Money *</p>
            <div className="flex items-center border-2 border-border rounded-lg overflow-hidden focus-within:border-primary transition-colors">
              <span className="px-3 py-2.5 bg-surface-grey text-sm font-semibold text-text-secondary border-r border-border flex-shrink-0">
                +{country.prefix}
              </span>
              <input
                type="tel"
                value={localNumber}
                onChange={e => setLocalNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="97123456"
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
              />
            </div>
            <p className="text-xs text-text-secondary">Numéro sans indicatif ni zéro initial</p>
          </div>
        </div>

        <Button variant="primary" size="lg" className="w-full" onClick={handleInitiatePayment} loading={submitting}>
          Payer {formatPrice(total, subscription.currency)}
        </Button>
        <button
          onClick={() => setStep('form')}
          className="text-sm text-text-secondary underline underline-offset-2 hover:text-text-primary transition-colors text-center"
        >
          Retour
        </button>
      </div>
    )
  }

  /* ── Main form ── */
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
              onClick={() => { setDeliveryMethod(opt.value); setSelectedZone(null) }}
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
          <div className="flex flex-col gap-4 pt-1">
            {/* Zone selector */}
            {deliveryZones.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text-primary">Choisissez votre ville *</p>
                <div className="flex flex-col gap-2">
                  {deliveryZones.map((zone, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedZone(zone)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors text-sm ${
                        selectedZone?.city === zone.city
                          ? 'border-primary bg-primary-surface text-primary'
                          : 'border-border text-text-primary hover:border-primary/40'
                      }`}
                    >
                      <span className="font-medium">{zone.city}</span>
                      <span className={`text-xs font-semibold ${selectedZone?.city === zone.city ? 'text-primary' : 'text-text-secondary'}`}>
                        {zone.cost === 0 ? 'Gratuit' : `+ ${formatPrice(zone.cost, subscription.currency)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">Aucune zone de livraison définie par le prestataire.</p>
            )}

            {/* Precise address */}
            <Input
              label="Adresse précise *"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              placeholder="Ex : Rue 234, Quartier Cadjehoun"
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
            onChange={() => setStartAsap(false)}
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
        {paymentMethod !== 'CASH' && (
          <p className="text-xs text-text-secondary">
            Vous serez redirigé vers la saisie de votre numéro Mobile Money après confirmation.
          </p>
        )}
      </div>

      {/* Total & CTA */}
      <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Abonnement</span>
          <span className="font-medium">{formatPrice(subscription.price, subscription.currency)}</span>
        </div>
        {deliveryMethod === 'DELIVERY' && selectedZone && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Frais de livraison ({selectedZone.city})</span>
            <span className="font-medium">
              {selectedZone.cost === 0 ? 'Gratuit' : formatPrice(selectedZone.cost, subscription.currency)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary text-xl">{formatPrice(total, subscription.currency)}</span>
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={handleSubmit} loading={submitting}>
          {paymentMethod === 'CASH' ? 'Confirmer la commande' : 'Continuer vers le paiement'}
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
