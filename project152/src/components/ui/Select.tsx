import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectGroup {
  label: string
  options: SelectOption[]
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  placeholder?: string
  options?: (SelectOption | SelectGroup)[]
  multiple?: boolean
}

const isSelectGroup = (item: SelectOption | SelectGroup): item is SelectGroup => {
  return 'options' in item
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      placeholder,
      options = [],
      multiple = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const selectClasses = cn(
      'w-full px-3 py-2 rounded-lg border bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer',
      error
        ? 'border-danger-500 focus:ring-danger-500'
        : 'border-slate-300',
      disabled && 'opacity-50 cursor-not-allowed bg-slate-50',
      multiple && 'min-h-[120px]',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            multiple={multiple}
            disabled={disabled}
            {...props}
          >
            {placeholder && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((item, index) => {
              if (isSelectGroup(item)) {
                return (
                  <optgroup key={index} label={item.label}>
                    {item.options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                )
              }
              return (
                <option
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                >
                  {item.label}
                </option>
              )
            })}
          </select>
          {!multiple && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
