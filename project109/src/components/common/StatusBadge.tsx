import { cn } from '@/lib/utils';

type StatusType = 'normal' | 'warning' | 'danger' | 'expired' | 'success' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  normal: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-primary-100 text-primary-800 border-primary-200',
  pending: 'bg-accent-100 text-accent-800 border-accent-200',
};

const statusLabels: Record<StatusType, string> = {
  normal: '正常',
  warning: '即将到期',
  danger: '即将过期',
  expired: '已过期',
  success: '有效',
  pending: '待处理',
};

export default function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          status === 'normal' && 'bg-green-500',
          status === 'warning' && 'bg-yellow-500',
          status === 'danger' && 'bg-red-500',
          status === 'expired' && 'bg-gray-500',
          status === 'success' && 'bg-primary-500',
          status === 'pending' && 'bg-accent-500'
        )}
      />
      {children || statusLabels[status]}
    </span>
  );
}
