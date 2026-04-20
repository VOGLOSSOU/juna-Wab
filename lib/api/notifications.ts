import { apiClient } from './client'
import type { Notification, ApiResponse } from '@/types'

export async function getNotifications() {
  const res = await apiClient.get<ApiResponse<Notification[]>>('/notifications')
  return res.data.data
}

export async function markNotificationRead(id: string) {
  const res = await apiClient.put<ApiResponse<Notification>>(`/notifications/${id}/read`)
  return res.data.data
}

export async function markAllNotificationsRead() {
  const res = await apiClient.put<ApiResponse<void>>('/notifications/read-all')
  return res.data
}
