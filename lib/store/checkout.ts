import { createStore } from 'zustand/vanilla'
import type { CreateOrderForm, DeliveryMethod, Order, Subscription } from '@/types'
import type { InitiatePaymentPayload, PaymentInitiated, PaymentStatus } from '@/lib/api/payments'
import { availableDeliveryModes, hasUnresolvedPayment, isPaidOrder, MOBILE_MONEY_OPERATORS,
  normalizePaymentPhone, parseDeliveryZones, paymentNeedsVerification } from '@/lib/utils/payment'
import type { DeliveryZone, MobileMoneyProvider } from '@/lib/utils/payment'
import { getApiErrorCode, getApiErrorMessage } from '@/lib/utils/api-error'

type Phase = 'loading' | 'form' | 'payment' | 'processing' | 'pending' | 'failed' | 'confirmed' | 'error' | 'not-started'
type Timer = ReturnType<typeof setTimeout>
interface Dependencies {
  getAccountId: () => string | null
  now?: () => number
  getSubscription: (id: string) => Promise<Subscription>
  getOrder: (id: string) => Promise<Order>
  createOrder: (payload: CreateOrderForm) => Promise<Order>
  initiatePayment: (payload: InitiatePaymentPayload) => Promise<PaymentInitiated>
  getPaymentStatus: (id: string) => Promise<PaymentStatus>
  onPaid: (orderId: string) => void
  onOrderCreated?: (orderId: string) => void
  schedule?: (callback: () => void, delay: number) => Timer
  cancel?: (timer: Timer) => void
}
export interface CheckoutState {
  phase: Phase
  subscription: Subscription | null
  order: Order | null
  paymentId: string | null
  deliveryMethod: DeliveryMethod | null
  provider: MobileMoneyProvider | null
  phone: string
  busy: boolean
  checking: boolean
  error: string | null
  errorCode: string | null
  load: (input: { subscriptionId?: string; orderId?: string }) => Promise<void>
  selectDelivery: (mode: DeliveryMethod) => void
  selectProvider: (provider: MobileMoneyProvider) => void
  setPhone: (phone: string) => void
  create: (input: { zone: DeliveryZone | null; address: string; startAsap: boolean; requestedDate?: string }) => Promise<void>
  pay: () => Promise<void>
  retry: () => void
  restart: () => Promise<void>
  verify: () => Promise<void>
  pause: () => void
  resume: () => void
  dispose: () => void
}

export function createCheckoutStore(deps: Dependencies) {
  const schedule = deps.schedule ?? setTimeout
  const cancel = deps.cancel ?? clearTimeout
  const now = deps.now ?? Date.now
  let generation = 0
  let accountId: string | null = null
  let disposed = false
  let paused = false
  let pollTimer: Timer | null = null
  let waitTimer: Timer | null = null
  let initiationTimer: Timer | null = null
  let initiationDeadline: number | null = null
  const clearTimers = () => {
    if (pollTimer !== null) cancel(pollTimer)
    if (waitTimer !== null) cancel(waitTimer)
    if (initiationTimer !== null) cancel(initiationTimer)
    pollTimer = waitTimer = initiationTimer = null
  }
  const current = (version: number) => !disposed && version === generation && accountId === deps.getAccountId()
  const publishError = (error: unknown, fallback?: string) => store.setState({error: getApiErrorMessage(error, fallback), errorCode: getApiErrorCode(error) ?? null})
  const paid = (orderId: string) => {
    clearTimers()
    store.setState({phase: 'confirmed', busy: false, checking: false, error: null})
    deps.onPaid(orderId)
  }
  const watchPayment = () => {
    clearTimers()
    store.setState({phase: 'processing', error: null, errorCode: null})
    const version = generation
    waitTimer = schedule(() => {
      if (!current(version) || store.getState().phase !== 'processing') return
      if (pollTimer !== null) cancel(pollTimer)
      pollTimer = null
      store.setState({phase: 'pending'})
    }, 180000)
    if (!store.getState().paymentId && initiationDeadline !== null) {
      initiationTimer = schedule(() => {
        if (current(version)) void store.getState().verify()
      }, Math.max(0, initiationDeadline - now()))
    }
    if (!paused) pollTimer = schedule(() => { void store.getState().verify() }, 0)
  }
  const acceptOrder = (order: Order, preserveProvider = false) => {
    store.setState({order, paymentId: order.payment?.id ?? null,
      ...(!preserveProvider ? {provider: MOBILE_MONEY_OPERATORS.find(op => op.method === order.payment?.method)?.provider ?? null} : {})})
    if (isPaidOrder(order)) { paid(order.id); return true }
    if (order.status !== 'PENDING') {
      clearTimers()
      store.setState({phase: 'error', error: 'Cette commande ne peut plus être payée.'})
      return true
    }
    if (hasUnresolvedPayment(order)) { watchPayment(); return true }
    return false
  }
  const store = createStore<CheckoutState>((set, get) => ({
    phase: 'loading', subscription: null, order: null, paymentId: null,
    deliveryMethod: null, provider: null, phone: '', busy: false, checking: false, error: null, errorCode: null,
    load: async ({subscriptionId, orderId}) => {
      clearTimers()
      disposed = false
      initiationDeadline = null
      const version = ++generation
      accountId = deps.getAccountId()
      set({phase: 'loading', subscription: null, order: null, paymentId: null,
        deliveryMethod: null, provider: null, phone: '', busy: false, checking: false, error: null, errorCode: null})
      if (!accountId) return
      try {
        if (orderId) {
          const order = await deps.getOrder(orderId)
          if (!current(version)) return
          if (!acceptOrder(order)) set({phase: 'payment'})
        } else if (subscriptionId) {
          const subscription = await deps.getSubscription(subscriptionId)
          if (!current(version)) return
          const modes = availableDeliveryModes(subscription.provider)
          set({subscription, deliveryMethod: modes[0] ?? null, phase: 'form'})
        } else set({phase: 'error', error: 'Choisissez un abonnement pour continuer.'})
      } catch (error) {
        if (current(version)) { set({phase: 'error'}); publishError(error, 'Impossible de charger cette commande. Réessayez.') }
      }
    },
    selectDelivery: mode => {
      const state = get()
      if (!state.busy && availableDeliveryModes(state.subscription?.provider).includes(mode)) set({deliveryMethod: mode, error: null})
    },
    selectProvider: provider => {
      if (!get().busy && MOBILE_MONEY_OPERATORS.some(op => op.provider === provider)) set({provider, error: null})
    },
    setPhone: phone => { if (!get().busy) set({phone, error: null}) },
    create: async ({zone, address, startAsap, requestedDate}) => {
      const state = get()
      if (state.busy || state.phase !== 'form' || !state.subscription) return
      const method = state.deliveryMethod
      if (!method || !availableDeliveryModes(state.subscription.provider).includes(method)) {
        set({error: 'Ce prestataire ne propose actuellement aucun mode de réception.'}); return
      }
      if (method === 'DELIVERY' && (!zone || !address.trim())) {
        set({error: 'Choisissez votre zone de livraison et renseignez votre adresse précise.'}); return
      }
      if (!startAsap && (!requestedDate || !Number.isFinite(new Date(requestedDate).getTime()))) {
        set({error: 'Choisissez une date de début valide.'}); return
      }
      const version = generation
      set({busy: true, error: null, errorCode: null})
      try {
        const fresh = await deps.getSubscription(state.subscription.id)
        if (!current(version)) return
        set({subscription: fresh})
        const modes = availableDeliveryModes(fresh.provider)
        if (!modes.includes(method)) {
          set({deliveryMethod: modes[0] ?? null, error: 'Les modes de réception ont changé. Vérifiez les options du prestataire.'}); return
        }
        if (method === 'DELIVERY' && !parseDeliveryZones(fresh.deliveryZones).some(item => item.city === zone?.city)) {
          set({error: 'Les zones de livraison ont changé. Choisissez une zone disponible.'}); return
        }
        const order = await deps.createOrder({subscriptionId: fresh.id, deliveryMethod: method,
          ...(method === 'DELIVERY' ? {deliveryAddress: address.trim(), deliveryCity: zone!.city}
            : {pickupLocation: fresh.provider?.businessAddress}),
          startAsap, ...(!startAsap ? {requestedStartDate: new Date(requestedDate!).toISOString()} : {})})
        if (!current(version)) return
        set({order, phase: 'payment'})
        deps.onOrderCreated?.(order.id)
      } catch (error) {
        if (current(version)) publishError(error, 'Impossible de confirmer la création. Consultez vos commandes avant de recommencer.')
      } finally { if (current(version)) set({busy: false}) }
    },
    pay: async () => {
      const state = get()
      if (state.busy || !state.order || state.phase !== 'payment') return
      const provider = state.provider
      if (!provider) { set({error: 'Choisissez MTN, Moov ou Celtiis.'}); return }
      const phoneNumber = normalizePaymentPhone(state.phone)
      if (!phoneNumber) { set({error: 'Numéro invalide : utilisez 10 chiffres commençant par 01.'}); return }
      const version = generation
      let sent = false
      set({busy: true, error: null, errorCode: null})
      try {
        const freshOrder = await deps.getOrder(state.order.id)
        if (!current(version)) return
        if (acceptOrder(freshOrder, true)) return
        sent = true
        initiationDeadline = now() + 90000
        const result = await deps.initiatePayment({orderId: freshOrder.id, phoneNumber, provider})
        if (!current(version)) return
        set({paymentId: result.paymentId})
        if (result.status === 'SUCCESS') paid(freshOrder.id)
        else if (result.status === 'FAILED') set({phase: 'failed', error: result.message || 'Paiement refusé par l’opérateur.'})
        else watchPayment()
      } catch (error) {
        if (!current(version)) return
        if (sent && paymentNeedsVerification(error)) watchPayment()
        else publishError(error, 'Impossible de vérifier cette commande. Réessayez la vérification.')
      } finally { if (current(version)) set({busy: false}) }
    },
    retry: () => {
      if (get().phase === 'failed') set({phase: 'payment', error: null})
    },
    restart: async () => {
      const state = get()
      if (state.phase !== 'not-started' || state.busy || state.checking || !state.order) return
      const version = generation
      if (!current(version)) return
      set({busy: true, error: null, errorCode: null})
      try {
        // Re-check at the click: a delayed first request may have arrived since
        // the last absence check. The backend also serializes by this same order.
        const order = await deps.getOrder(state.order.id)
        if (!current(version)) return
        if (acceptOrder(order, true)) return
        if (order.payment === null && initiationDeadline !== null && now() >= initiationDeadline || order.payment?.status === 'FAILED') {
          clearTimers()
          initiationDeadline = null
          set({phase: 'payment', order, paymentId: order.payment?.id ?? null, error: null})
        } else {
          set({phase: 'pending', error: 'L’absence de paiement n’est pas encore confirmée. Vérifiez à nouveau.'})
        }
      } catch (error) {
        if (current(version)) {
          set({phase: 'pending'})
          publishError(error, 'Impossible de vérifier cette commande. Vérifiez le paiement avant de le relancer.')
        }
      } finally { if (current(version)) set({busy: false}) }
    },
    verify: async () => {
      const state = get()
      if (disposed || paused || state.checking || !state.order || !['processing', 'pending', 'not-started'].includes(state.phase)) return
      const version = generation
      if (!current(version)) return
      if (pollTimer !== null) cancel(pollTimer)
      pollTimer = null
      const checkedAfterWindow = initiationDeadline !== null && now() >= initiationDeadline
      set({checking: true})
      try {
        let id = get().paymentId
        if (!id) {
          const order = await deps.getOrder(state.order.id)
          if (!current(version)) return
          set({order})
          if (isPaidOrder(order)) { paid(order.id); return }
          if (order.status !== 'PENDING') { clearTimers(); set({phase: 'error', error: 'Cette commande ne peut plus être payée.'}); return }
          id = order.payment?.id ?? null
          set({paymentId: id})
          if (!id && order.payment === null && checkedAfterWindow) {
            clearTimers()
            set({phase: 'not-started', error: null, errorCode: null})
            return
          }
          if (id && get().phase === 'not-started') watchPayment()
        }
        if (!id) return
        const status = await deps.getPaymentStatus(id)
        if (!current(version)) return
        if (status.orderId !== state.order.id) throw new Error('Commande de paiement incohérente.')
        if (status.status === 'SUCCESS') paid(state.order.id)
        else if (status.status === 'FAILED') { clearTimers(); set({phase: 'failed', error: 'Paiement refusé. Vérifiez votre solde et votre opérateur.'}) }
        else if (status.status === 'REFUNDED') { clearTimers(); set({phase: 'pending', error: 'Ce paiement nécessite un contrôle. Contactez l’assistance.'}) }
      } catch { /* A network error never proves that a payment failed. */ }
      finally {
        if (current(version)) {
          set({checking: false})
          if (!paused && get().phase === 'processing') pollTimer = schedule(() => { void get().verify() }, 5000)
        }
      }
    },
    pause: () => { paused = true; if (pollTimer !== null) cancel(pollTimer); pollTimer = null },
    resume: () => { paused = false; void get().verify() },
    dispose: () => { disposed = true; generation++; clearTimers() },
  }))
  return store
}
