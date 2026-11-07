import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type { MobileMoneyProvider } from '@/lib/utils/payment'

export interface InitiatePaymentPayload {
  orderId: string
  phoneNumber: string
  provider: MobileMoneyProvider
}
export type PaymentState = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export interface PaymentInitiated {
  paymentId: string
  reference: string | null
  status: PaymentState
  message: string
}
export interface PaymentStatus {
  id: string
  orderId: string
  amount: number
  currency: string
  method: string
  status: PaymentState
  paidAt: string | null
  createdAt: string
}
export async function initiatePayment(payload: InitiatePaymentPayload): Promise<PaymentInitiated> {
  const res = await apiClient.post<ApiResponse<PaymentInitiated>>('/payments/initiate', payload, { timeout: 90000 })
  const result = res.data.data
  if (!result?.paymentId || !result.status) throw new Error('Réponse de paiement inconnue. Vérifiez votre commande.')
  return result
}
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  const res = await apiClient.get<ApiResponse<PaymentStatus>>(`/payments/${encodeURIComponent(paymentId)}/status`, { timeout: 45000 })
  const result = res.data.data
  if (result?.id !== paymentId || !result.orderId || !result.status) throw new Error('Statut de paiement inattendu.')
  return result
}
