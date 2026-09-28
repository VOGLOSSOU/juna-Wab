import { apiClient } from './client'
import type { Subscription, HomeResponse, ApiResponse, PaginatedResponse, SortOption, SubscriptionType, SubscriptionCategory, SubscriptionDuration } from '@/types'

export async function getHome(cityId: string) {
  const res = await apiClient.get<ApiResponse<HomeResponse>>(`/home?cityId=${cityId}&limit=10`)
  return res.data.data
}

export interface GetSubscriptionsParams {
  cityId?: string
  sort?: SortOption
  page?: number
  limit?: number
  category?: SubscriptionCategory
  type?: SubscriptionType
  duration?: SubscriptionDuration
  search?: string
  landmarkId?: string
  minPrice?: number
  maxPrice?: number
}

interface RawSubscriptionsResponse {
  subscriptions: Subscription[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export async function getSubscriptions(params: GetSubscriptionsParams): Promise<PaginatedResponse<Subscription>> {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  const res = await apiClient.get<ApiResponse<RawSubscriptionsResponse>>(`/subscriptions?${query}`)
  const { subscriptions, pagination } = res.data.data
  return {
    items: subscriptions,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
    hasMore: pagination.page < pagination.totalPages,
  }
}

export async function getSubscription(id: string) {
  const res = await apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`)
  return res.data.data
}

export async function getProviderSubscriptions(): Promise<Subscription[]> {
  const res = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions/me')
  return res.data.data
}

export async function createSubscription(data: {
  name: string
  description: string
  price: number
  type: string
  category: string
  duration: string
  imageUrl: string
  mealIds: string[]
  isPublic?: boolean
  isImmediate?: boolean
  preparationHours?: number
}) {
  const res = await apiClient.post<ApiResponse<Subscription>>('/subscriptions', data)
  return res.data.data
}

export async function updateSubscription(id: string, data: Partial<{
  name: string
  description: string
  price: number
  type: string
  category: string
  duration: string
  imageUrl: string
  mealIds: string[]
}>) {
  const res = await apiClient.put<ApiResponse<Subscription>>(`/subscriptions/${id}`, data)
  return res.data.data
}

export async function deleteSubscription(id: string) {
  const res = await apiClient.delete<ApiResponse<void>>(`/subscriptions/${id}`)
  return res.data
}

export async function toggleSubscriptionActive(id: string) {
  const res = await apiClient.put<ApiResponse<{ id: string; isActive: boolean }>>(`/subscriptions/${id}/toggle`)
  return res.data.data
}

export async function toggleSubscriptionPublic(id: string) {
  const res = await apiClient.put<ApiResponse<{ id: string; isPublic: boolean }>>(`/subscriptions/${id}/public`)
  return res.data.data
}
