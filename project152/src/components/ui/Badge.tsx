import * as React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'active'
  | 'expired'
  | 'success'
  | 'warning'
  | 'danger'
  | 'risk-low'
  | 'risk-medium'
  | 'risk-high'
  | 'risk-critical'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', dot = false, children, ...props }, ref) => {
    const variantStyles: Record<BadgeVariant, string> = {
      default: 'bg-slate-100 text-slate-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-success-100 text-success-800',
      overdue: 'bg-danger-100 text-danger-800',
      active: 'bg-primary-100 text-primary-800',
      expired: 'bg-slate-100 text-slate-600',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      danger: 'bg-red-100 text-red-800',
      'risk-low': 'bg-green-100 text-green-800',
      'risk-medium': 'bg-yellow-100 text-yellow-800',
      'risk-high': 'bg-orange-100 text-orange-800',
      'risk-critical': 'bg-red-100 text-red-800'
    }

    const dotColors: Record<BadgeVariant, string> = {
      default: 'bg-slate-500',
      pending: 'bg-yellow-500',
      paid: 'bg-success-500',
      overdue: 'bg-danger-500',
      active: 'bg-primary-500',
      expired: 'bg-slate-400',
      success: 'bg-green-500',
      warning: 'bg-orange-500',
      danger: 'bg-red-500',
      'risk-low': 'bg-green-500',
      'risk-medium': 'bg-yellow-500',
      'risk-high': 'bg-orange-500',
      'risk-critical': 'bg-red-500'
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              dotColors[variant]
            )}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
