import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  autoResize?: boolean
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled = false,
      readOnly = false,
      autoResize = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    const resizeTextarea = React.useCallback(() => {
      if (type === 'textarea' && autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [type, autoResize])

    React.useEffect(() => {
      resizeTextarea()
    }, [value, resizeTextarea])

    const inputClasses = cn(
      'w-full px-3 py-2 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      error
        ? 'border-danger-500 focus:ring-danger-500'
        : 'border-slate-300',
      (disabled || readOnly) && 'opacity-50 cursor-not-allowed bg-slate-50',
      type === 'textarea' && 'resize-none min-h-[80px]',
      className
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange?.(e as React.ChangeEvent<HTMLInputElement>)
      if (type === 'textarea') {
        resizeTextarea()
      }
    }

    const setTextareaRef = (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el
      if (typeof ref === 'function') {
        ref(el)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
      }
    }

    const setInputRef = (el: HTMLInputElement | null) => {
      if (typeof ref === 'function') {
        ref(el)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLInputElement | null>).current = el
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          {type === 'textarea' ? (
            <textarea
              ref={setTextareaRef}
              className={inputClasses}
              disabled={disabled}
              readOnly={readOnly}
              value={value}
              onChange={handleChange}
              {...(props as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={setInputRef}
              type={type}
              className={inputClasses}
              disabled={disabled}
              readOnly={readOnly}
              value={value}
              onChange={handleChange}
              {...props}
            />
          )}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
