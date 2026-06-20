import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCount?: boolean
  maxLength?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      disabled,
      value,
      defaultValue,
      onChange,
      required,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState<string | number>(
      (value as string)?.length || (defaultValue as string)?.length || 0
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setCharCount(String(value).length)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const renderLabel = () => {
      if (!label) return null
      return (
        <label className="block text-sm font-semibold text-warmGray-700 mb-1.5">
          {label}
          {required && <span className="text-accent-500 ml-1">*</span>}
        </label>
      )
    }

    const renderError = () => {
      if (!error) return null
      return <p className="mt-1.5 text-sm text-red-500">{error}</p>
    }

    const renderHelperText = () => {
      if (error || !helperText) return null
      return <p className="mt-1.5 text-sm text-warmGray-500">{helperText}</p>
    }

    const renderCharCount = () => {
      if (!showCount || !maxLength) return null
      return (
        <div className="absolute bottom-2 right-3 text-xs text-warmGray-400">
          {charCount}/{maxLength}
        </div>
      )
    }

    return (
      <div className="w-full">
        {renderLabel()}
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            maxLength={maxLength}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl border-2 bg-white transition-all duration-200 placeholder:text-warmGray-400 focus:outline-none resize-none",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-warmGray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100",
              disabled && "bg-warmGray-50 cursor-not-allowed opacity-60",
              showCount && maxLength && "pb-8",
              className
            )}
            disabled={disabled}
            required={required}
            {...props}
          />
          {renderCharCount()}
        </div>
        {renderError()}
        {renderHelperText()}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
