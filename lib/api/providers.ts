import { apiClient } from './client'
import type { ApiResponse, PublicProviderProfile } from '@/types'

export async function getPublicProvider(id: string): Promise<PublicProviderProfile> {
  const res = await apiClient.get<ApiResponse<PublicProviderProfile>>(`/providers/${id}`)
  return res.data.data
}

export async function setPayoutInfo(data: { payoutPhoneNumber: string; payoutNetwork: 'MTN' | 'MOOV' }) {
  const res = await apiClient.put<ApiResponse<{ payoutPhoneNumber: string; payoutNetwork: string }>>('/providers/me/payout', data)
  return res.data.data
}
