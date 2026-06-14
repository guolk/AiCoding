import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  className,
  label,
  error,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 placeholder-earth-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px]',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
