import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-forest-600 to-forest-700 text-white hover:from-forest-700 hover:to-forest-800 hover:shadow-lg hover:shadow-forest-600/30 hover:-translate-y-0.5 focus:ring-forest-500',
    secondary: 'bg-earth-100 dark:bg-earth-900/50 text-earth-800 dark:text-earth-200 hover:bg-earth-200 dark:hover:bg-earth-800/50 border border-earth-200 dark:border-earth-700 focus:ring-earth-500',
    ghost: 'text-forest-700 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-800/30 focus:ring-forest-500',
    outline: 'border-2 border-forest-600 text-forest-600 hover:bg-forest-50 dark:border-forest-400 dark:text-forest-400 dark:hover:bg-forest-900/50 focus:ring-forest-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 focus:ring-red-500',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5',
    icon: 'p-2.5',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantClasses: Record<string, string> = {
    default: 'text-earth-600 hover:text-earth-900 hover:bg-earth-100 dark:text-earth-400 dark:hover:text-earth-100 dark:hover:bg-earth-800/50',
    ghost: 'text-earth-600 hover:text-earth-900 hover:bg-earth-100/50 dark:text-earth-400 dark:hover:text-earth-100 dark:hover:bg-earth-800/30',
    filled: 'bg-forest-600 text-white hover:bg-forest-700 shadow-lg shadow-forest-600/30',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
