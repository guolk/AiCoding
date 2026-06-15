import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  trendUp?: boolean
  color?: 'green' | 'orange' | 'blue'
}

const colorClasses = {
  green: 'border-racing-green/30 shadow-glow-sm',
  orange: 'border-racing-orange/30 shadow-glow-orange',
  blue: 'border-blue-500/30',
}

export default function StatCard({ title, value, icon, trend, trendUp = true, color = 'green' }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-dark-800 border p-5 transition-all duration-300 hover:shadow-glow',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </div>
        <div className={cn(
          'p-2 border',
          color === 'green' && 'bg-racing-green/10 border-racing-green/30 text-racing-green',
          color === 'orange' && 'bg-racing-orange/10 border-racing-orange/30 text-racing-orange',
          color === 'blue' && 'bg-blue-500/10 border-blue-500/30 text-blue-400'
        )}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="font-mono text-3xl font-bold text-gray-100">
          {value}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trendUp ? 'text-racing-green' : 'text-racing-orange'
          )}>
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  )
}
