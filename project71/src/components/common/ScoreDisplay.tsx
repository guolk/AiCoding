import React from 'react'
import { ProgressRing } from './ProgressRing'
import clsx from 'clsx'

interface ScoreDisplayProps {
  score: number
  maxScore?: number
  label?: string
  size?: number
  showDetails?: boolean
  className?: string
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  maxScore = 100,
  label = '得分',
  size = 140,
  showDetails = true,
  className = ''
}) => {
  const percentage = Math.round((score / maxScore) * 100)
  
  const getColor = () => {
    if (percentage >= 80) return 'success'
    if (percentage >= 60) return 'primary'
    if (percentage >= 40) return 'warning'
    return 'error'
  }

  const getFeedback = () => {
    if (percentage >= 90) return { text: '优秀！', emoji: '🌟' }
    if (percentage >= 80) return { text: '很好！', emoji: '👏' }
    if (percentage >= 70) return { text: '不错！', emoji: '👍' }
    if (percentage >= 60) return { text: '继续加油！', emoji: '💪' }
    return { text: '需要多练习', emoji: '📚' }
  }

  const feedback = getFeedback()

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <ProgressRing
        progress={percentage}
        size={size}
        strokeWidth={10}
        color={getColor() as 'success' | 'primary' | 'warning' | 'error'}
        label={label}
      />
      {showDetails && (
        <div className="mt-4 text-center">
          <div className="text-3xl mb-2">{feedback.emoji}</div>
          <p className="text-lg font-semibold text-gray-700">{feedback.text}</p>
          <p className="text-sm text-gray-500 mt-1">
            {score} / {maxScore} 分
          </p>
        </div>
      )}
    </div>
  )
}
