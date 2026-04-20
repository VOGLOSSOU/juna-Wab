import { apiClient } from './client'
import type { Country, City, Landmark, ApiResponse } from '@/types'

export async function getCountries() {
  const res = await apiClient.get<ApiResponse<Country[]>>('/countries')
  return res.data.data
}

export async function getCities(countryCode: string) {
  const res = await apiClient.get<ApiResponse<City[]>>(`/countries/${countryCode}/cities`)
  return res.data.data
}

export async function getLandmarks(cityId: string) {
  const res = await apiClient.get<ApiResponse<Landmark[]>>(`/cities/${cityId}/landmarks`)
  return res.data.data
}
