import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type RatingSize = "sm" | "md" | "lg"

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  max?: number
  size?: RatingSize
  readOnly?: boolean
  allowHalf?: boolean
  color?: string
  emptyColor?: string
  showValue?: boolean
  onChange?: (value: number) => void
}

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = "md",
  readOnly = false,
  allowHalf = false,
  color = "text-champagne-400",
  emptyColor = "text-warmGray-200",
  showValue = false,
  onChange,
  className,
  ...props
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  const sizes: Record<RatingSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const gapSizes: Record<RatingSize, string> = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  }

  const displayValue = hoverValue !== null ? hoverValue : value
  const clampedValue = Math.min(Math.max(displayValue, 0), max)

  const handleClick = (index: number, isHalf: boolean) => {
    if (readOnly) return
    const newValue = isHalf && allowHalf ? index + 0.5 : index + 1
    onChange?.(newValue)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (readOnly || !allowHalf) return
    const rect = e.currentTarget.getBoundingClientRect()
    const isHalf = (e.clientX - rect.left) < rect.width / 2
    setHoverValue(isHalf ? index + 0.5 : index + 1)
  }

  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  const isFilled = (index: number): boolean => {
    return index < Math.floor(clampedValue)
  }

  const isHalfFilled = (index: number): boolean => {
    return allowHalf && index === Math.floor(clampedValue) && clampedValue % 1 !== 0
  }

  return (
    <div
      className={cn("inline-flex items-center", gapSizes[size], className)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className={cn("flex items-center", gapSizes[size])}>
        {Array.from({ length: max }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "relative",
              !readOnly && "cursor-pointer transition-transform hover:scale-110"
            )}
            onClick={() => handleClick(index, false)}
            onMouseMove={(e) => handleMouseMove(e, index)}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled(index) || isHalfFilled(index) ? color : emptyColor,
                "transition-colors"
              )}
              fill={isFilled(index) ? "currentColor" : isHalfFilled(index) ? "url(#half-fill)" : "none"}
              strokeWidth={2}
            />
            {allowHalf && (
              <div
                className="absolute top-0 left-0 w-1/2 h-full overflow-hidden"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick(index, true)
                }}
              >
                <Star
                  className={cn(sizes[size], isHalfFilled(index) ? color : "transparent")}
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {showValue && (
        <span className={cn("ml-2 font-semibold", size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base", "text-warmGray-700")}>
          {value.toFixed(allowHalf ? 1 : 0)}/{max}
        </span>
      )}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <linearGradient id="half-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export { Rating }
