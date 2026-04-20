import { apiClient } from './client'
import type { Review, ApiResponse, PaginatedResponse } from '@/types'

interface RawReviewsResponse {
  reviews: Review[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export async function getSubscriptionReviews(subscriptionId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
  const res = await apiClient.get<ApiResponse<RawReviewsResponse>>(
    `/reviews/subscription/${subscriptionId}?page=${page}&limit=${limit}`
  )
  const { reviews, pagination } = res.data.data
  return {
    items: reviews,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
    hasMore: pagination.page < pagination.totalPages,
  }
}

export async function createReview(data: { orderId: string; subscriptionId: string; rating: number; comment?: string }) {
  const res = await apiClient.post<ApiResponse<Review>>('/reviews', data)
  return res.data.data
}
