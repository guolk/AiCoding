import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
            'disabled:bg-gray-50 disabled:cursor-not-allowed resize-none',
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
