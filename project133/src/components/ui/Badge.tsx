import React from 'react';
import { cn } from '@/lib/utils.js';
import type { ReportStatus } from '../../../shared/types.js';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-teal-50 text-teal-700 border border-teal-200',
    warning: 'bg-orange-50 text-orange-700 border border-orange-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    outline: 'bg-transparent text-slate-600 border border-slate-300',
    secondary: 'bg-slate-200 text-slate-700'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const config = {
    'ungraded': { label: '待批改', variant: 'warning' as const },
    'graded': { label: '已批改', variant: 'success' as const },
    'needs-revision': { label: '需修改', variant: 'danger' as const }
  };

  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};
