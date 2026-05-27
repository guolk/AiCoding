import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'

export interface ModalProps {
  visible: boolean
  title: string
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  children: React.ReactNode
  className?: string
}

export default function Modal({
  visible,
  title,
  onClose,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
  children,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden',
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[calc(90vh-140px)] overflow-y-auto">
          {children}
        </div>
        {onConfirm && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}