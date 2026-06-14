import { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmButtonClass = 'bg-red-500 hover:bg-red-600',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-900">{title}</h4>
          <div className="mt-2 text-sm text-gray-600">{message}</div>
        </div>
      </div>
    </Modal>
  )
}
