import { ReactNode, MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ children, className, hoverable = false, padding = 'md', onClick }: CardProps) {
  const paddingClass = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl shadow-sm border border-warm-200/50',
        'transition-all duration-300 ease-in-out',
        hoverable && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        paddingClass,
        className
      )}
    >
      {children}
    </div>
  );
}
