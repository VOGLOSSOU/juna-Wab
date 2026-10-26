import { apiClient } from './client'
import { favoriteAccountId, favoriteRevision, tagFavoriteAccount } from './favorite-context'
import type { ApiResponse, Subscription } from '@/types'

export interface FavoritesResponse {
  favorites: Subscription[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export async function getFavorites(page = 1, limit = 20): Promise<FavoritesResponse> {
  const accountId = favoriteAccountId()
  const requestRevision = favoriteRevision()
  const res = await apiClient.get<ApiResponse<FavoritesResponse>>('/favorites', { params: { page, limit } })
  return { ...res.data.data, favorites: res.data.data.favorites.map(sub => tagFavoriteAccount(sub, accountId, requestRevision)) }
}

export async function setFavorite(subscriptionId: string, isFavorite: boolean) {
  const res = isFavorite
    ? await apiClient.post<ApiResponse<{ subscriptionId: string; isFavorite: boolean }>>('/favorites', { subscriptionId })
    : await apiClient.delete<ApiResponse<{ subscriptionId: string; isFavorite: boolean }>>(`/favorites/${subscriptionId}`)
  if (res.data.data.subscriptionId !== subscriptionId || res.data.data.isFavorite !== isFavorite) {
    throw new Error('Réponse de favoris inattendue')
  }
  return res.data.data.isFavorite
}
