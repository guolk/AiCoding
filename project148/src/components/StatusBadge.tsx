import { getStatusColor, getStatusText } from '@/utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const text = getStatusText(status);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${colorClass}`}
    >
      {text}
    </span>
  );
}
