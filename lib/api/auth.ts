import { apiClient } from './client'
import type { User, Provider, ApiResponse } from '@/types'

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface AuthResponse {
  user: User
  tokens: AuthTokens
  isProfileComplete: boolean
}

export async function login(data: { email: string; password: string }) {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
  return {
    user: res.data.data.user,
    accessToken: res.data.data.tokens.accessToken,
    refreshToken: res.data.data.tokens.refreshToken,
  }
}

export async function register(data: { name: string; email: string; phone?: string; password: string }) {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
  return {
    user: res.data.data.user,
    accessToken: res.data.data.tokens.accessToken,
    refreshToken: res.data.data.tokens.refreshToken,
  }
}

export async function logout(refreshToken: string) {
  await apiClient.post('/auth/logout', { refreshToken })
}

export async function getMe() {
  const res = await apiClient.get<ApiResponse<User>>('/auth/me')
  return res.data.data
}

export async function getUserProfile() {
  const res = await apiClient.get<ApiResponse<User>>('/users/me')
  return res.data.data
}

export async function updateMe(data: Partial<{ name: string; phone: string; address: string; cityId: string; avatarUrl: string }>) {
  const res = await apiClient.put<ApiResponse<User>>('/users/me', data)
  return res.data.data
}

export async function updateLocation(cityId: string) {
  const res = await apiClient.put<ApiResponse<{ cityId: string; cityName: string; countryCode: string }>>('/users/me/location', { cityId })
  return res.data.data
}

export async function updatePreferences(data: {
  dietaryRestrictions?: string[]
  favoriteCategories?: string[]
  notifications?: { email: boolean; push: boolean; sms: boolean }
}) {
  const res = await apiClient.put<ApiResponse<User>>('/users/me/preferences', data)
  return res.data.data
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await apiClient.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword })
  return res.data
}

export async function getProviderProfile() {
  const res = await apiClient.get<ApiResponse<Provider>>('/providers/me')
  return res.data.data
}

export async function updateProviderProfile(data: Partial<Provider>) {
  const res = await apiClient.put<ApiResponse<Provider>>('/providers/me', data)
  return res.data.data
}

export async function registerProvider(data: {
  businessName: string
  description?: string
  businessAddress: string
  logo: string
  cityId: string
  acceptsDelivery: boolean
  acceptsPickup: boolean
  deliveryZones?: { city: string; country: string; cost: number }[]
  landmarkIds?: string[]
  documentUrl?: string
}) {
  const res = await apiClient.post<ApiResponse<Provider>>('/providers/register', data)
  return res.data.data
}
