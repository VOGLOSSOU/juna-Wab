import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '@/lib/utils'
import type { ProposalStatus } from '@/types'

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: PROPOSAL_STATUS_COLORS[status] }}
    >
      {PROPOSAL_STATUS_LABELS[status]}
    </span>
  )
}
