'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getReceivedProposals } from '@/lib/api/proposals'
import { ProposalStatusBadge } from '@/components/ui/proposal-status-badge'
import { Button } from '@/components/ui/button'
import { formatDate, getInitials } from '@/lib/utils'
import type { SubscriptionProposal, ProposalStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: ProposalStatus | '' }[] = [
  { label: 'Toutes', value: '' },
  { label: 'En attente', value: 'PENDING' },
  { label: 'Approuvées', value: 'APPROVED' },
  { label: 'Rejetées', value: 'REJECTED' },
]

export default function DashboardProposalsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const router = useRouter()
  const [proposals, setProposals] = useState<SubscriptionProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ProposalStatus | ''>('')

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getReceivedProposals().then(setProposals).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  const filtered = filter ? proposals.filter((p) => p.status === filter) : proposals

  if (loading) return <div className="p-10 text-center text-text-secondary">Chargement...</div>

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-text-secondary hover:bg-surface-grey transition-colors flex-shrink-0"
          aria-label="Retour"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="flex-1 flex items-center justify-between">
          <h1 className="text-headline-large font-semibold">Propositions reçues</h1>
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-sm">{proposals.length} proposition{proposals.length !== 1 ? 's' : ''}</span>
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p>Aucune proposition{filter ? ` avec ce statut` : ''} pour le moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-surface flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {getInitials(proposal.user?.name ?? '?')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{proposal.user?.name ?? 'Client'}</p>
                  <ProposalStatusBadge status={proposal.status} />
                </div>
                <p className="text-sm text-text-secondary line-clamp-1">
                  {proposal.meals.length} plat{proposal.meals.length !== 1 ? 's' : ''} demandé{proposal.meals.length !== 1 ? 's' : ''}
                  {proposal.message ? ` — "${proposal.message}"` : ''}
                </p>
                <p className="text-xs text-text-light mt-0.5">{formatDate(proposal.createdAt)}</p>
              </div>
              <Link href={`/dashboard/proposals/${proposal.id}`}>
                <Button size="sm" variant="ghost">Détail</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
