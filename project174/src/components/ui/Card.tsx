import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        glass
          ? 'bg-white/80 dark:bg-forest-900/80 backdrop-blur-md border border-white/20 dark:border-forest-700/30'
          : 'bg-white dark:bg-forest-900 border border-earth-100 dark:border-forest-800',
        hover && 'card-hover cursor-pointer',
        className
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-b border-earth-100 dark:border-forest-800', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn('text-xl font-semibold text-earth-900 dark:text-earth-100 font-display', className)}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-earth-600 dark:text-earth-400 mt-1', className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-0 flex items-center', className)}>
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  onClick,
}) => {
  return (
    <Card glass hover className={className} onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-earth-600 dark:text-earth-400">{title}</p>
            <p className="text-3xl font-bold text-earth-900 dark:text-earth-100 mt-2 font-display">
              {value}
            </p>
            {trend && (
              <p className={cn(
                'text-sm mt-2 flex items-center gap-1',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                {Math.abs(trend.value)}%
                <span className="text-earth-500 ml-1">vs 上月</span>
              </p>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-xl bg-forest-100 dark:bg-forest-800/50 text-forest-600 dark:text-forest-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
