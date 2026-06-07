import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  className?: string
  children?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  className,
  children,
  ...props
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      {...props}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  showClose?: boolean
  onClose?: () => void
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  className,
  children,
  showClose = true,
  onClose,
  ...props
}) => (
  <div
    className={cn(
      'flex items-center justify-between p-6 border-b border-gray-200',
      className
    )}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {showClose && onClose && (
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    )}
  </div>
)

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
  children?: React.ReactNode
}

const ModalTitle: React.FC<ModalTitleProps> = ({
  className,
  children,
  ...props
}) => (
  <h2
    className={cn('text-xl font-semibold text-gray-900', className)}
    {...props}
  >
    {children}
  </h2>
)

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
  children?: React.ReactNode
}

const ModalDescription: React.FC<ModalDescriptionProps> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn('text-sm text-gray-500 mt-1', className)}
    {...props}
  >
    {children}
  </p>
)

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

const ModalContent: React.FC<ModalContentProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('p-6', className)}
    {...props}
  >
    {children}
  </div>
)

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex items-center justify-end gap-3 p-6 border-t border-gray-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter }
