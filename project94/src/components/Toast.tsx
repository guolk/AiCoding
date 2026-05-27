import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '../utils/cn'

export interface ToastProps {
  type?: 'success' | 'error' | 'info'
  message: string
  visible: boolean
  onClose: () => void
  duration?: number
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    textColor: 'text-green-800',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
  },
}

export default function Toast({
  type = 'success',
  message,
  visible,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (visible) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose])

  if (!visible && !isVisible) return null

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300',
        config.bgColor,
        config.borderColor,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Icon className={cn('w-5 h-5', config.iconColor)} />
      <span className={cn('text-sm font-medium', config.textColor)}>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className={cn('ml-2 p-0.5 rounded hover:bg-black/5', config.textColor)}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}