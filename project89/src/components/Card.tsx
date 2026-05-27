import { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export default function Card({ title, children, className = '', actions }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
