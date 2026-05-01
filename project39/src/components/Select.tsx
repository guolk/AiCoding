import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  isRequired?: boolean;
  register?: UseFormRegisterReturn;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      fullWidth = false,
      isRequired = false,
      className = '',
      register,
      placeholder,
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = !!error;

    const baseSelectClasses =
      'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200 appearance-none bg-white cursor-pointer';

    const selectClasses = [
      baseSelectClasses,
      hasError
        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500',
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';
    const errorClasses = 'mt-1 text-sm text-red-600';
    const helperClasses = 'mt-1 text-sm text-gray-500';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className={labelClasses}>
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            aria-invalid={hasError}
            aria-describedby={errorMessage ? 'select-error' : helperText ? 'select-helper' : undefined}
            {...register}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {errorMessage && (
          <p id="select-error" className={errorClasses}>
            {errorMessage}
          </p>
        )}
        {!errorMessage && helperText && (
          <p id="select-helper" className={helperClasses}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
