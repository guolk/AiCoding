import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:from-primary-500 hover:to-primary-600 hover:shadow-lg hover:-translate-y-0.5 focus:ring-primary-300",
      secondary: "bg-white border-2 border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-200",
      accent: "bg-accent-400 text-white hover:bg-accent-500 hover:shadow-lg hover:-translate-y-0.5 focus:ring-accent-300",
      ghost: "bg-transparent text-warmGray-700 hover:bg-warmGray-100 focus:ring-warmGray-200",
    }

    const sizes: Record<ButtonSize, string> = {
      sm: "px-4 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3 text-lg",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon}
        {children}
        {rightIcon}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
