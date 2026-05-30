import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'full';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-sage-500 text-white hover:bg-sage-600 hover:shadow-soft hover:translate-y-[-1px] active:translate-y-0',
    secondary: 'bg-white text-sage-700 border border-sage-200 hover:bg-sage-50 hover:border-sage-300',
    accent: 'bg-terracotta-400 text-white hover:bg-terracotta-500 hover:shadow-soft',
    ghost: 'bg-transparent text-sage-700 hover:bg-sage-50',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    full: 'w-full px-6 py-3 text-sm',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : '';

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], disabledClasses, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
