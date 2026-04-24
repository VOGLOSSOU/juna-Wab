import { apiClient } from './client'
import type { ActiveSubscription, ApiResponse } from '@/types'

export async function getMyActiveSubscriptions(): Promise<ActiveSubscription[]> {
  const res = await apiClient.get<ApiResponse<ActiveSubscription[]>>('/active-subscriptions/me')
  return res.data.data
}

export interface CheckActiveSubscriptionParams {
  category?: string
  type?: string
}

export async function checkActiveSubscription(params?: CheckActiveSubscriptionParams): Promise<{ hasActive: boolean }> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.type) query.set('type', params.type)
  const res = await apiClient.get<ApiResponse<{ hasActive: boolean }>>(`/active-subscriptions/check${query.toString() ? '?' + query.toString() : ''}`)
  return res.data.data
}

export async function getProviderActiveSubscriptions(): Promise<ActiveSubscription[]> {
  const res = await apiClient.get<ApiResponse<ActiveSubscription[]>>('/active-subscriptions/provider/me')
  return res.data.data
}

export async function getActiveSubscriptionsStats(): Promise<{ activeSubscriptionsCount: number }> {
  const res = await apiClient.get<ApiResponse<{ activeSubscriptionsCount: number }>>('/active-subscriptions/stats')
  return res.data.data
}