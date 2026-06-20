import * as React from "react"
import { cn } from "@/lib/utils"

export type ProgressBarVariant = "primary" | "accent" | "champagne" | "success"
export type ProgressBarSize = "sm" | "md" | "lg"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: ProgressBarVariant
  size?: ProgressBarSize
  showPercentage?: boolean
  showLabel?: boolean
  label?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  showPercentage = false,
  showLabel = false,
  label,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variants: Record<ProgressBarVariant, string> = {
    primary: "bg-gradient-to-r from-primary-400 to-primary-500",
    accent: "bg-gradient-to-r from-accent-400 to-accent-500",
    champagne: "bg-gradient-to-r from-champagne-400 to-champagne-500",
    success: "bg-gradient-to-r from-green-400 to-green-500",
  }

  const sizes: Record<ProgressBarSize, string> = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {showLabel && label && (
            <span className="text-sm font-medium text-warmGray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-warmGray-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-warmGray-100 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar }
