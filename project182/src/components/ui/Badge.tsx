import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "champagne" | "gray"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "primary", dot = false, children, ...props }, ref) => {
    const variants: Record<BadgeVariant, string> = {
      primary: "bg-primary-100 text-primary-700",
      secondary: "bg-warmGray-100 text-warmGray-700",
      accent: "bg-accent-100 text-accent-600",
      success: "bg-green-100 text-green-700",
      warning: "bg-amber-100 text-amber-700",
      error: "bg-red-100 text-red-700",
      champagne: "bg-champagne-100 text-champagne-700",
      gray: "bg-warmGray-50 text-warmGray-600",
    }

    const dotColors: Record<BadgeVariant, string> = {
      primary: "bg-primary-500",
      secondary: "bg-warmGray-500",
      accent: "bg-accent-500",
      success: "bg-green-500",
      warning: "bg-amber-500",
      error: "bg-red-500",
      champagne: "bg-champagne-500",
      gray: "bg-warmGray-400",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      >
        {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
