import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number
  max?: number
  color?: 'green' | 'blue' | 'orange' | 'red' | 'primary'
  showLabel?: boolean
  height?: number
}

const colorMap = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  primary: 'bg-primary-500',
}

export default function ProgressBar({ value, max = 100, color = 'primary', showLabel = false, height = 8 }: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (barRef.current) {
      observer.observe(barRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 800
    const steps = 30
    const stepValue = percentage / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= percentage) {
        setDisplayValue(percentage)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [percentage, isVisible])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className="mb-1 text-sm font-medium text-gray-600">
            {Math.round(displayValue)}%
          </span>
        )}
      </div>
      <div
        ref={barRef}
        className={cn('w-full overflow-hidden rounded-full bg-gray-200')}
        style={{ height: `${height}px` }}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colorMap[color])}
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  )
}
