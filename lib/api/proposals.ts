import { apiClient } from './client'
import type { ApiResponse, ApproveProposalForm, CreateProposalForm, ProposalStatus, Subscription, SubscriptionProposal } from '@/types'

interface ProposalListResponse {
  data: SubscriptionProposal[]
  total: number
  page: number
  totalPages: number
}

export async function createProposal(data: CreateProposalForm) {
  const res = await apiClient.post<ApiResponse<SubscriptionProposal>>('/subscription-proposals', data)
  return res.data.data
}

export async function getMyProposals(status?: ProposalStatus): Promise<SubscriptionProposal[]> {
  const res = await apiClient.get<ApiResponse<ProposalListResponse>>('/subscription-proposals/me', { params: status ? { status } : undefined })
  return res.data.data?.data ?? []
}

export async function getReceivedProposals(status?: ProposalStatus): Promise<SubscriptionProposal[]> {
  const res = await apiClient.get<ApiResponse<ProposalListResponse>>('/subscription-proposals/received', { params: status ? { status } : undefined })
  return res.data.data?.data ?? []
}

export async function getProposal(id: string) {
  const res = await apiClient.get<ApiResponse<SubscriptionProposal>>(`/subscription-proposals/${id}`)
  return res.data.data
}

export async function approveProposal(id: string, data: ApproveProposalForm) {
  const res = await apiClient.post<ApiResponse<Subscription>>(`/subscription-proposals/${id}/approve`, data)
  return res.data.data
}

export async function rejectProposal(id: string, rejectionReason: string) {
  const res = await apiClient.post<ApiResponse<SubscriptionProposal>>(`/subscription-proposals/${id}/reject`, { rejectionReason })
  return res.data.data
}
