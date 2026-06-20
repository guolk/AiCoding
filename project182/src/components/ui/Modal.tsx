import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  closeOnOverlayClick?: boolean
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}) => {
  const overlayRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  const sizes: Record<NonNullable<ModalProps["size"]>, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-warmGray-900/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "w-full bg-white rounded-2xl shadow-xl animate-slide-up",
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-warmGray-100">
          <div className="flex-1">
            {title && <h2 className="text-xl font-semibold text-accent-500">{title}</h2>}
            {description && <p className="text-sm text-warmGray-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-xl text-warmGray-400 hover:text-warmGray-600 hover:bg-warmGray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-warmGray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export { Modal }
