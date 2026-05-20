import React from 'react'
import clsx from 'clsx'

interface WaveformProps {
  data: number[]
  color?: 'primary' | 'success' | 'warning' | 'error'
  height?: number
  animated?: boolean
  className?: string
}

const colorClasses = {
  primary: 'bg-gradient-to-t from-primary-400 to-primary-600',
  success: 'bg-gradient-to-t from-green-400 to-green-600',
  warning: 'bg-gradient-to-t from-amber-400 to-amber-600',
  error: 'bg-gradient-to-t from-red-400 to-red-600'
}

export const Waveform: React.FC<WaveformProps> = ({
  data,
  color = 'primary',
  height = 100,
  animated = false,
  className = ''
}) => {
  return (
    <div className={clsx('flex items-end justify-center gap-[2px]', className)} style={{ height }}>
      {data.map((value, index) => (
        <div
          key={index}
          className={clsx(
            'w-[4px] rounded-full transition-all duration-200',
            colorClasses[color],
            animated && 'wave-bar'
          )}
          style={{
            height: `${value}%`,
            animationDelay: `${index * 0.05}s`
          }}
        />
      ))}
    </div>
  )
}
