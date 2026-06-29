import { apiClient } from './client'
import type { ApiResponse, PublicProviderProfile } from '@/types'

export async function getPublicProvider(id: string): Promise<PublicProviderProfile> {
  const res = await apiClient.get<ApiResponse<PublicProviderProfile>>(`/providers/${id}`)
  return res.data.data
}
