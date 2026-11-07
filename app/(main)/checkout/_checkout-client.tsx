'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { useAuthStore } from '@/lib/store/auth'
import { getSubscription } from '@/lib/api/subscriptions'
import { createOrder, getOrder } from '@/lib/api/orders'
import { initiatePayment, getPaymentStatus } from '@/lib/api/payments'
import { createCheckoutStore } from '@/lib/store/checkout'
import { MOBILE_MONEY_OPERATORS, availableDeliveryModes, parseDeliveryZones } from '@/lib/utils/payment'
import type { DeliveryZone } from '@/lib/utils/payment'
import { SubscriptionInstructions } from '@/components/ui/subscription-instructions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'

export function CheckoutForm() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const accountId = useAuthStore(state => state.user?.id)
  const router = useRouter()
  const search = useSearchParams()
  const subscriptionId = search.get('subscriptionId') ?? ''
  const orderId = search.get('orderId') ?? ''
  const checkout = useMemo(() => createCheckoutStore({getSubscription, getOrder, createOrder, initiatePayment, getPaymentStatus,
    getAccountId: () => { const auth = useAuthStore.getState(); return auth.isAuthenticated ? auth.user?.id ?? null : null },
    onPaid: id => router.replace(`/checkout/confirmation?orderId=${encodeURIComponent(id)}`),
    onOrderCreated: id => router.replace(`/checkout?orderId=${encodeURIComponent(id)}`, {scroll: false}),
  }), [router])
  const owner = useRef<string | null>(null)
  const state = useStore(checkout)
  const [zone, setZone] = useState<DeliveryZone | null>(null)
  const [address, setAddress] = useState('')
  const [startAsap, setStartAsap] = useState(true)
  const [requestedDate, setRequestedDate] = useState('')

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      checkout.getState().dispose()
      owner.current = null
      return
    }
    const sameAccount = owner.current === accountId
    owner.current = accountId ?? null
    // Updating the URL after creating the order must not interrupt a payment
    // the user has already started on this same checkout instance.
    if (sameAccount && orderId && checkout.getState().order?.id === orderId && checkout.getState().phase !== 'loading') return
    void checkout.getState().load({subscriptionId, orderId})
  }, [checkout, hydrated, isAuthenticated, accountId, subscriptionId, orderId])
  useEffect(() => () => checkout.getState().dispose(), [checkout])
  useEffect(() => {
    const resume = () => { if (document.visibilityState === 'hidden') checkout.getState().pause(); else checkout.getState().resume() }
    window.addEventListener('focus', resume)
    document.addEventListener('visibilitychange', resume)
    return () => { window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', resume) }
  }, [checkout])
  useEffect(() => { window.scrollTo({top: 0, behavior: 'smooth'}) }, [state.phase])

  if (!hydrated || !isAuthenticated || state.phase === 'loading' || state.phase === 'confirmed') {
    return <div className="max-w-2xl mx-auto px-4 py-12" role="status">Chargement...</div>
  }
  const sub = state.subscription
  const order = state.order
  const amount = order?.amount ?? order?.totalAmount ?? sub?.price ?? 0
  const currency = order?.currency ?? sub?.currency
  const name = order?.subscription?.name ?? sub?.name ?? 'Votre abonnement'
  const image = sub?.images?.[0] ?? sub?.imageUrl
  const modes = availableDeliveryModes(sub?.provider)
  const zones = parseDeliveryZones(sub?.deliveryZones)
  const delivery = state.deliveryMethod === 'DELIVERY'
  const summary = <div className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-white p-5">
    {image && <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg"><Image src={image} alt={name} fill sizes="80px" className="object-cover" /></div>}
    <div className="min-w-0 flex-1"><h2 className="font-semibold break-words">{name}</h2>
      {sub && <p className="text-xs text-text-secondary">{SUBSCRIPTION_DURATION_LABELS[sub.duration]}</p>}
      <p className="mt-1 font-bold text-primary">{formatPrice(amount, currency)}</p></div>
  </div>
  const error = state.error && <p role="alert" className="rounded-lg border border-error/20 bg-red-50 p-3 text-sm text-error">{state.error}</p>
  const ordersLink = <Link href="/profile/orders" className="text-center text-sm text-primary underline underline-offset-2">Voir mes commandes</Link>

  if (state.phase === 'error') return <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-12">{error}
    <Button onClick={() => void state.load({subscriptionId, orderId})}>Vérifier à nouveau</Button>{ordersLink}</div>
  if (state.phase === 'not-started') return <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 text-center">
    <h1 className="text-2xl font-semibold">Paiement non enregistré</h1>
    <p className="text-sm leading-relaxed text-text-secondary">Aucun paiement n’est enregistré pour cette commande. Vous pouvez relancer le paiement. La commande sera vérifiée une nouvelle fois avant de continuer.</p>
    {summary}{error}
    <Button loading={state.busy || state.checking} onClick={() => void state.restart()}>Relancer le paiement</Button>
    {ordersLink}
  </div>
  if (state.phase === 'processing' || state.phase === 'pending') return <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-surface text-3xl text-primary" aria-hidden="true">
      {state.phase === 'pending' && !state.checking ? '◷' : <span className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />}
    </div>
    <h1 className="text-2xl font-semibold">{state.phase === 'pending' ? 'Confirmation en attente' : 'Vérification du paiement'}</h1>
    <p className="text-sm leading-relaxed text-text-secondary">{state.phase === 'pending'
      ? 'Le paiement peut toujours être en cours. Ne lancez pas un nouveau paiement. Vérifiez son état ici ou depuis vos commandes.'
      : 'Si une demande apparaît sur votre téléphone, validez-la avec votre code PIN Mobile Money. Nous attendons la confirmation du paiement.'}</p>
    {summary}{error}
    {state.phase === 'pending' && <Button loading={state.checking} onClick={() => void state.verify()}>Vérifier le paiement</Button>}
    {ordersLink}
  </div>
  if (state.phase === 'failed') return <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 text-center">
    <h1 className="text-2xl font-semibold">Paiement refusé</h1>{summary}{error}
    <Button onClick={state.retry}>Réessayer</Button>{ordersLink}
  </div>
  if (state.phase === 'payment') return <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
    <h1 className="text-2xl font-semibold">Payer par Mobile Money</h1>{summary}
    <SubscriptionInstructions instructions={sub?.instructions ?? order?.subscription?.instructions} />
    <fieldset disabled={state.busy} className="flex flex-col gap-5 rounded-xl border border-border bg-white p-5">
      <legend className="px-1 text-sm font-semibold">1. Choisissez votre réseau au Bénin</legend>
      <div className="grid grid-cols-3 gap-2">{MOBILE_MONEY_OPERATORS.map(op => <button type="button" key={op.provider}
        aria-pressed={state.provider === op.provider} onClick={() => state.selectProvider(op.provider)}
        className={`rounded-lg border-2 px-2 py-3 text-sm font-semibold ${state.provider === op.provider ? 'border-primary bg-primary-surface text-primary' : 'border-border'}`}>{op.label}</button>)}</div>
      {state.provider && <Input label="2. Votre numéro Mobile Money" type="tel" inputMode="tel" autoComplete="tel"
        value={state.phone} onChange={event => state.setPhone(event.target.value)} placeholder="0166000000" />}
      <p className="text-xs text-text-secondary">10 chiffres commençant par 01. Vous pouvez aussi saisir le numéro complet avec +229.</p>
    </fieldset>{error}
    <Button size="lg" loading={state.busy} disabled={!state.provider} onClick={() => void state.pay()}>Payer {formatPrice(amount, currency)}</Button>
    <p className="text-center text-xs text-text-secondary">Le règlement de votre abonnement passe par Juna Eats.</p>{ordersLink}
  </div>
  if (!sub) return null
  return <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
    <h1 className="text-2xl font-semibold">Commander</h1>{summary}
    <SubscriptionInstructions instructions={sub.instructions} />
    <fieldset disabled={state.busy} className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5">
      <legend className="px-1 font-semibold">Mode de récupération</legend>
      {modes.length > 1 ? <div className="grid grid-cols-2 gap-3">{modes.map(mode => <button type="button" key={mode}
        aria-pressed={state.deliveryMethod === mode} onClick={() => {state.selectDelivery(mode); setZone(null)}}
        className={`rounded-lg border-2 p-4 text-sm font-semibold ${state.deliveryMethod === mode ? 'border-primary bg-primary-surface text-primary' : 'border-border'}`}>
        {mode === 'DELIVERY' ? 'Livraison à domicile' : 'Retrait sur place'}</button>)}</div>
        : <p className="text-sm">{modes.length === 0 ? 'Ce prestataire ne propose actuellement aucun mode de réception.'
          : delivery ? 'Ce prestataire propose uniquement la livraison.' : 'Ce prestataire propose uniquement le retrait sur place.'}</p>}
      {state.deliveryMethod === 'PICKUP' && <p className="text-sm text-text-secondary">{sub.provider?.businessAddress || 'Adresse de retrait à confirmer auprès du prestataire.'}</p>}
      {delivery && <>
        <label className="text-sm font-medium" htmlFor="delivery-zone">Ville de livraison</label>
        <select id="delivery-zone" value={zone && zones.some(item => item.city === zone.city) ? zone.city : ''}
          onChange={event => setZone(zones.find(item => item.city === event.target.value) ?? null)} className="rounded-lg border border-border bg-white p-3 text-sm">
          <option value="">Choisissez une zone</option>{zones.map((item, index) => <option key={`${item.city}-${index}`} value={item.city}>{item.city}</option>)}
        </select>
        <Input label="Adresse précise" value={address} onChange={event => setAddress(event.target.value)} placeholder="Rue, quartier et repère" />
        <p className="text-xs text-text-secondary">Les frais de livraison sont à confirmer auprès du prestataire. Le montant ci-dessous correspond à l’abonnement.</p>
      </>}
    </fieldset>
    <fieldset disabled={state.busy} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5">
      <legend className="px-1 font-semibold">Début souhaité</legend>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={startAsap} onChange={event => setStartAsap(event.target.checked)} />Dès que possible</label>
      {!startAsap && <Input label="Date souhaitée" type="datetime-local" value={requestedDate} onChange={event => setRequestedDate(event.target.value)} />}
    </fieldset>
    <div className="rounded-xl border border-border bg-white p-5 text-sm"><h2 className="mb-2 font-semibold">Paiement via Juna Eats</h2>
      <p className="text-text-secondary">Votre abonnement se règle par MTN, Moov ou Celtiis, en livraison comme en retrait. Vous choisirez votre opérateur à l’étape suivante.</p></div>
    {error}{state.errorCode === 'EMAIL_NOT_VERIFIED' && <Link className="text-primary underline" href="/auth/verify-email">Vérifier mon email</Link>}
    <div className="flex items-center justify-between font-semibold"><span>Total de l’abonnement</span><span className="text-xl text-primary">{formatPrice(amount, currency)}</span></div>
    <Button size="lg" loading={state.busy} disabled={modes.length === 0} onClick={() => void state.create({zone, address, startAsap, requestedDate})}>Continuer vers le paiement</Button>
  </div>
}
