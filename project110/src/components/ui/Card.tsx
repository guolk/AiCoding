import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  transparent?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  transparent = false,
  onClick,
}) => {
  const baseClasses = transparent
    ? 'bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6'
    : 'bg-white rounded-2xl shadow-soft p-6';
  
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-medium' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={cn(baseClasses, hoverClasses, clickClasses, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
