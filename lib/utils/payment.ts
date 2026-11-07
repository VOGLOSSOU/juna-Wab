import type { DeliveryMethod, Order, ProviderSummary } from '@/types'

export const MOBILE_MONEY_OPERATORS = [
  { provider: 'MTN', method: 'MOBILE_MONEY_MTN', label: 'MTN' },
  { provider: 'MOOV', method: 'MOBILE_MONEY_MOOV', label: 'Moov' },
  { provider: 'CELTIIS', method: 'MOBILE_MONEY_CELTIIS', label: 'Celtiis' },
] as const
export type MobileMoneyProvider = typeof MOBILE_MONEY_OPERATORS[number]['provider']
export type DeliveryZone = { city: string; cost: number }

export function availableDeliveryModes(provider?: ProviderSummary): DeliveryMethod[] {
  return [provider?.acceptsDelivery === true ? 'DELIVERY' : null,
    provider?.acceptsPickup === true ? 'PICKUP' : null].filter((mode): mode is DeliveryMethod => mode !== null)
}
export function normalizePaymentPhone(input: string): string | null {
  const digits = input.trim().replace(/[\s()+.-]/g, '')
  if (/^01\d{8}$/.test(digits)) return `229${digits}`
  return /^22901\d{8}$/.test(digits) ? digits : null
}
export function parseDeliveryZones(raw: unknown): DeliveryZone[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((value: unknown) => {
    if (typeof value === 'string') {
      const [city, cost] = value.split(' · ')
      return city.trim() ? [{ city: city.trim(), cost: Number(cost?.replace(/[^\d.]/g, '') || 0) }] : []
    }
    if (value && typeof value === 'object' && 'city' in value && typeof value.city === 'string') {
      const cost = 'cost' in value ? Number(value.cost) : 0
      return value.city.trim() ? [{ city: value.city.trim(), cost: Number.isFinite(cost) ? cost : 0 }] : []
    }
    return []
  })
}
export function hasUnresolvedPayment(order: Order) {
  return !!order.payment && order.payment.status !== 'FAILED'
}
export function isPaidOrder(order: Order) {
  return ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(order.status) &&
    order.payment?.status !== 'FAILED' && order.payment?.status !== 'REFUNDED'
}
export function paymentNeedsVerification(error: unknown) {
  const err = error as { response?: { status?: number; data?: {error?: {code?: string}; code?: string} } }
  const code = err?.response?.data?.error?.code ?? err?.response?.data?.code
  return !err?.response || (err.response.status ?? 0) >= 500 ||
    code === 'PAYMENT_ALREADY_PROCESSED' || code === 'PAYMENT_REVIEW_REQUIRED'
}
export function paymentStatusLabel(order: Order) {
  const status = order.payment?.status
  if (status === 'SUCCESS') return 'Payé'
  if (status === 'FAILED') return 'Paiement refusé'
  if (status === 'REFUNDED') return 'Remboursé'
  return isPaidOrder(order) ? 'Payé' : order.payment ? 'Confirmation en attente' : 'En attente de paiement'
}
