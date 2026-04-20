import { apiClient } from './client'
import type { ApiResponse } from '@/types'

type UploadFolder = 'avatars' | 'providers' | 'meals' | 'subscriptions' | 'documents'

export async function uploadImage(folder: UploadFolder, file: File): Promise<string> {
  const form = new FormData()
  form.append('image', file)

  const res = await apiClient.post<ApiResponse<{ url: string }>>(`/upload/${folder}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data.url
}
