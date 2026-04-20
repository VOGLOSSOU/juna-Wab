import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:   'bg-primary-surface text-primary',
        success:   'bg-green-100 text-green-800',
        error:     'bg-red-100 text-red-800',
        warning:   'bg-yellow-100 text-yellow-800',
        info:      'bg-blue-100 text-blue-800',
        grey:      'bg-surface-grey text-text-secondary',
        outline:   'border border-border text-text-secondary bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
