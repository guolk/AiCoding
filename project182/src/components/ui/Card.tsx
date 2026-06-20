import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  footer?: React.ReactNode
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, footer, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl shadow-card p-6 transition-all duration-300",
          hoverable && "hover:shadow-cardHover hover:-translate-y-1 cursor-pointer",
          className
        )}
        {...props}
      >
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-xl font-semibold text-accent-500 mb-1">{title}</h3>}
            {subtitle && <p className="text-sm text-warmGray-500">{subtitle}</p>}
          </div>
        )}
        <div className="flex-1">{children}</div>
        {footer && <div className="mt-4 pt-4 border-t border-warmGray-100">{footer}</div>}
      </div>
    )
  }
)

Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4", className)} {...props} />
  )
)

CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-semibold text-accent-500", className)} {...props} />
  )
)

CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-warmGray-500", className)} {...props} />
  )
)

CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1", className)} {...props} />
  )
)

CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-4 pt-4 border-t border-warmGray-100", className)} {...props} />
  )
)

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
