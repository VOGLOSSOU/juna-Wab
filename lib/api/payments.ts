import { apiClient } from './client'
import type { ApiResponse } from '@/types'

export interface InitiatePaymentPayload {
  orderId: string
  phoneNumber: string
  provider?: string
}

export interface PaymentInitiated {
  paymentId: string
  depositId: string
  status: 'PROCESSING'
  message: string
}

export interface PaymentStatus {
  id: string
  orderId: string
  amount: number
  currency: string
  method: string
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED'
  paidAt: string | null
  createdAt: string
}

export async function initiatePayment(payload: InitiatePaymentPayload): Promise<PaymentInitiated> {
  const res = await apiClient.post<ApiResponse<PaymentInitiated>>('/payments/initiate', payload)
  return res.data.data
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  const res = await apiClient.get<ApiResponse<PaymentStatus>>(`/payments/${paymentId}/status`)
  return res.data.data
}
