import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizes: Record<NonNullable<InputProps["size"]>, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-5 py-3 text-lg",
    }

    const iconSizes: Record<NonNullable<InputProps["size"]>, string> = {
      sm: "left-3",
      md: "left-4",
      lg: "left-5",
    }

    const rightIconSizes: Record<NonNullable<InputProps["size"]>, string> = {
      sm: "right-3",
      md: "right-4",
      lg: "right-5",
    }

    const paddingLeft = leftIcon ? (size === "sm" ? "pl-9" : size === "md" ? "pl-11" : "pl-14") : ""
    const paddingRight = rightIcon ? (size === "sm" ? "pr-9" : size === "md" ? "pr-11" : "pr-14") : ""

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-warmGray-700 mb-1.5">
            {label}
            {props.required && <span className="text-accent-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-warmGray-400", iconSizes[size])}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border-2 bg-white transition-all duration-200 placeholder:text-warmGray-400 focus:outline-none",
              sizes[size],
              paddingLeft,
              paddingRight,
              error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-warmGray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100",
              disabled && "bg-warmGray-50 cursor-not-allowed opacity-60",
              className
            )}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className={cn("absolute top-1/2 -translate-y-1/2 text-warmGray-400", rightIconSizes[size])}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-sm text-warmGray-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
