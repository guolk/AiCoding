
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg';

  const variants = {
    primary: 'bg-gradient-to-r from-gold to-copper text-dark-bg hover:from-gold/90 hover:to-copper/90 focus:ring-gold/50 shadow-lg shadow-gold/20',
    secondary: 'bg-dark-border text-gray-200 hover:bg-dark-border/80 focus:ring-dark-border/50',
    ghost: 'bg-transparent text-gray-300 hover:bg-dark-border/50 focus:ring-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
