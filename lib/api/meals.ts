import { apiClient } from './client'
import type { Meal, ApiResponse, MealForm } from '@/types'

export async function getMyMeals(): Promise<Meal[]> {
  const res = await apiClient.get<ApiResponse<Meal[]>>('/meals/me')
  return res.data.data
}

export async function createMeal(data: MealForm) {
  const res = await apiClient.post<ApiResponse<Meal>>('/meals', data)
  return res.data.data
}

export async function updateMeal(id: string, data: Partial<MealForm & { isActive: boolean }>) {
  const res = await apiClient.put<ApiResponse<Meal>>(`/meals/${id}`, data)
  return res.data.data
}

export async function toggleMeal(id: string) {
  const res = await apiClient.put<ApiResponse<{ id: string; isActive: boolean }>>(`/meals/${id}/toggle`)
  return res.data.data
}

export async function deleteMeal(id: string) {
  const res = await apiClient.delete<ApiResponse<void>>(`/meals/${id}`)
  return res.data
}
