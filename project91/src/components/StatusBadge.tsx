import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
  type?: 'activity' | 'registration' | 'material' | 'demand' | 'priority';
}

const statusConfig: Record<string, Record<string, { label: string; className: string }>> = {
  activity: {
    draft: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
    recruiting: { label: '招募中', className: 'bg-blue-100 text-blue-700' },
    ongoing: { label: '进行中', className: 'bg-green-100 text-green-700' },
    completed: { label: '已完成', className: 'bg-gray-100 text-gray-700' },
    cancelled: { label: '已取消', className: 'bg-red-100 text-red-700' },
  },
  registration: {
    pending: { label: '待审核', className: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '已通过', className: 'bg-green-100 text-green-700' },
    rejected: { label: '已拒绝', className: 'bg-red-100 text-red-700' },
  },
  material: {
    pending: { label: '待准备', className: 'bg-yellow-100 text-yellow-700' },
    prepared: { label: '已准备', className: 'bg-blue-100 text-blue-700' },
    used: { label: '已使用', className: 'bg-gray-100 text-gray-700' },
  },
  demand: {
    open: { label: '开放中', className: 'bg-blue-100 text-blue-700' },
    matched: { label: '已匹配', className: 'bg-green-100 text-green-700' },
    completed: { label: '已完成', className: 'bg-gray-100 text-gray-700' },
    cancelled: { label: '已取消', className: 'bg-red-100 text-red-700' },
  },
  priority: {
    normal: { label: '普通', className: 'bg-gray-100 text-gray-700' },
    important: { label: '重要', className: 'bg-yellow-100 text-yellow-700' },
    urgent: { label: '紧急', className: 'bg-red-100 text-red-700' },
  },
};

export default function StatusBadge({ status, type = 'activity' }: StatusBadgeProps) {
  const config = statusConfig[type]?.[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
