import { apiClient } from './client'
import type { Order, CreateOrderForm, ApiResponse } from '@/types'

export async function createOrder(data: CreateOrderForm) {
  const res = await apiClient.post<ApiResponse<Order>>('/orders', data)
  return res.data.data
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await apiClient.get<ApiResponse<Order[]>>('/orders/me')
  return res.data.data
}

export async function getOrder(id: string) {
  const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
  return res.data.data
}

export async function cancelOrder(id: string) {
  const res = await apiClient.delete<ApiResponse<{ id: string; status: string }>>(`/orders/${id}`)
  return res.data.data
}

export async function completeOrder(id: string, qrCode: string) {
  const res = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/complete`, { qrCode })
  return res.data.data
}

export async function getProviderOrders(): Promise<Order[]> {
  const res = await apiClient.get<ApiResponse<Order[]>>('/orders/provider/me')
  return res.data.data
}

export async function activateOrder(id: string) {
  const res = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/activate`)
  return res.data.data
}

export async function regenerateQrCode(id: string) {
  const res = await apiClient.put<ApiResponse<{ id: string; qrCode: string }>>(`/orders/${id}/qrcode`)
  return res.data.data
}

export async function scanQrCode(id: string, qrCode: string) {
  const res = await apiClient.post<ApiResponse<Order>>(`/orders/scan/${id}/${qrCode}`)
  return res.data.data
}
