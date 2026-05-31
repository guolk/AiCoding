import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, className, hover = false, onClick, style }: CardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, actions, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        {title && <h3 className="text-lg font-serif font-semibold text-white">{title}</h3>}
        {subtitle && <p className="text-sm text-dark-muted mt-1">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn('mt-4 pt-4 border-t border-dark-border', className)}>{children}</div>;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      {icon && <div className="text-primary-400 mb-4">{icon}</div>}
      <h4 className="text-lg font-medium text-dark-text">{title}</h4>
      {description && <p className="text-sm text-dark-muted mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
