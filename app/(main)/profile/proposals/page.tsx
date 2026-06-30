/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getMyProposals } from '@/lib/api/proposals'
import { ProposalStatusBadge } from '@/components/ui/proposal-status-badge'
import { formatDate, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'
import type { SubscriptionProposal } from '@/types'

function Skeleton() {
  return (
    <div className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="h-8 w-56 bg-surface-grey rounded animate-pulse" />
      <div className="h-32 bg-surface-grey rounded-xl animate-pulse" />
      <div className="h-32 bg-surface-grey rounded-xl animate-pulse" />
    </div>
  )
}

export default function MyProposalsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const [proposals, setProposals] = useState<SubscriptionProposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getMyProposals().then(setProposals).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  if (!hydrated || loading) return <Skeleton />

  return (
    <div className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-large font-semibold">Mes propositions</h1>
        <span className="text-sm text-text-secondary">{proposals.length}</span>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center gap-3 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-light">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <p className="font-medium text-text-primary">Aucune proposition envoyée</p>
          <p className="text-sm text-text-secondary">Rendez-vous sur le profil d&apos;un prestataire pour lui proposer un abonnement sur mesure.</p>
          <Link href="/explorer" className="text-primary text-sm font-medium hover:underline mt-1">
            Explorer les prestataires →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl border border-border p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{proposal.provider?.businessName ?? 'Prestataire'}</p>
                <ProposalStatusBadge status={proposal.status} />
              </div>
              <p className="text-xs text-text-secondary">
                {SUBSCRIPTION_TYPE_LABELS[proposal.type]} · {SUBSCRIPTION_DURATION_LABELS[proposal.duration]} · {proposal.meals.length} plat{proposal.meals.length !== 1 ? 's' : ''}
              </p>
              {proposal.message && <p className="text-sm text-text-primary italic">"{proposal.message}"</p>}
              {proposal.status === 'REJECTED' && proposal.rejectionReason && (
                <p className="text-xs text-error">Motif : {proposal.rejectionReason}</p>
              )}
              {proposal.status === 'APPROVED' && proposal.resultingSubscriptionId && (
                <Link href={`/subscriptions/${proposal.resultingSubscriptionId}`} className="text-sm text-primary font-medium hover:underline mt-1">
                  Voir l'abonnement →
                </Link>
              )}
              <p className="text-xs text-text-light mt-1">{formatDate(proposal.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
