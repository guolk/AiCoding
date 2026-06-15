import { cn } from '@/lib/utils'

type BadgeVariant = 'green' | 'orange' | 'gray' | 'blue'

interface BadgeProps {
  text: string
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-racing-green/15 text-racing-green border-racing-green/30',
  orange: 'bg-racing-orange/15 text-racing-orange border-racing-orange/30',
  gray: 'bg-dark-700 text-gray-400 border-dark-600',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

export default function Badge({ text, variant = 'gray' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium border',
        variantClasses[variant]
      )}
    >
      {text}
    </span>
  )
}
