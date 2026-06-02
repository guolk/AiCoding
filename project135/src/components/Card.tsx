import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  title,
  children,
  className,
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-white p-6 shadow-sm border border-gray-100',
        hoverable || onClick
          ? 'cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20'
          : '',
        className
      )}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      )}
      {children}
    </div>
  );
}
