import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  className,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400">
          {leftIcon}
        </div>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 placeholder-earth-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
          {rightIcon}
        </div>
      )}
    </div>
  );
};
