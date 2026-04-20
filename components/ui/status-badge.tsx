import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import type { OrderStatus } from '@/types'

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = ORDER_STATUS_COLORS[status]
  const label = ORDER_STATUS_LABELS[status]

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}
