import type { PatentStatus } from '@/types/patent';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<PatentStatus, { label: string; className: string }> = {
  APPLICATION: {
    label: '申请中',
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  },
  SUBSTANTIVE_EXAMINATION: {
    label: '实质审查',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  },
  AUTHORIZED: {
    label: '已授权',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  },
  MAINTENANCE: {
    label: '维持中',
    className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  },
  ENFORCEMENT: {
    label: '维权中',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  },
  EXPIRED: {
    label: '已过期',
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
  },
};

export interface StatusBadgeProps {
  status: PatentStatus;
  onClick?: (status: PatentStatus) => void;
  className?: string;
  showLabel?: boolean;
}

export default function StatusBadge({
  status,
  onClick,
  className,
  showLabel = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        config.className,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={() => onClick?.(status)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(status);
        }
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {showLabel && config.label}
    </span>
  );
}
