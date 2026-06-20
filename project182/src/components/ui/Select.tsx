import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  size?: "sm" | "md" | "lg"
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      size = "md",
      placeholder = "请选择",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizes: Record<NonNullable<SelectProps["size"]>, string> = {
      sm: "px-3 py-1.5 text-sm pr-8",
      md: "px-4 py-2.5 text-base pr-10",
      lg: "px-5 py-3 text-lg pr-12",
    }

    const iconSizes: Record<NonNullable<SelectProps["size"]>, string> = {
      sm: "w-4 h-4 right-2",
      md: "w-5 h-5 right-3",
      lg: "w-5 h-5 right-4",
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-warmGray-700 mb-1.5">
            {label}
            {props.required && <span className="text-accent-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full rounded-xl border-2 bg-white transition-all duration-200 focus:outline-none appearance-none cursor-pointer",
              sizes[size],
              error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-warmGray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100",
              disabled && "bg-warmGray-50 cursor-not-allowed opacity-60",
              !props.value && "text-warmGray-400",
              className
            )}
            disabled={disabled}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-warmGray-400 pointer-events-none",
              iconSizes[size]
            )}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-sm text-warmGray-500">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
