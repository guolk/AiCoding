import { useEffect, useState, useRef } from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: number
  trendUp?: boolean
  color?: 'green' | 'orange' | 'blue' | 'red'
}

const gradientMap = {
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600',
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp = true, color = 'green' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500
    const steps = 60
    const stepValue = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, isVisible])

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        'bg-gradient-to-br',
        gradientMap[color]
      )}
    >
      <div className="absolute right-4 top-4 opacity-20">
        <Icon size={64} />
      </div>

      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">
          {displayValue.toLocaleString()}
        </p>

        {trend !== undefined && (
          <div className={cn('mt-3 flex items-center gap-1 text-sm', trendUp ? 'text-white' : 'text-white/90')}>
            {trendUp ? (
              <TrendingUp size={16} className="text-green-200" />
            ) : (
              <TrendingDown size={16} className="text-red-200" />
            )}
            <span className="font-medium">
              {trendUp ? '+' : ''}{trend}%
            </span>
            <span className="text-white/70">较上月</span>
          </div>
        )}
      </div>

      <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
    </div>
  )
}
