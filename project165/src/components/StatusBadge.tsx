interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusLabelMap: Record<string, string> = {
  active: '在用',
  maintenance: '维护中',
  retired: '退役',
  valid: '有效',
  expiring_soon: '即将到期',
  expired: '已过期',
  approved: '已批准',
  pending: '待审批',
  rejected: '已拒绝',
  not_required: '不需要',
  usable: '可用',
  reshoot: '需补拍',
  planning: '规划中',
  shooting: '拍摄中',
  review: '审核中',
  completed: '已完成',
  aerial: '航拍',
  mapping: '测绘',
  inspection: '巡检',
  performance: '表演',
  practice: '练习',
  signal_interference: '信号干扰',
  fault_alert: '故障报警',
  accident: '意外事故',
  other: '其他',
};

const statusColorMap: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  valid: 'bg-emerald-500/20 text-emerald-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  usable: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  maintenance: 'bg-amber-500/20 text-amber-400',
  pending: 'bg-amber-500/20 text-amber-400',
  reshoot: 'bg-amber-500/20 text-amber-400',
  expiring_soon: 'bg-amber-500/20 text-amber-400',
  retired: 'bg-red-500/20 text-red-400',
  expired: 'bg-red-500/20 text-red-400',
  rejected: 'bg-red-500/20 text-red-400',
  practice: 'bg-blue-500/20 text-blue-400',
  planning: 'bg-blue-500/20 text-blue-400',
  mapping: 'bg-cyan-500/20 text-cyan-400',
  inspection: 'bg-cyan-500/20 text-cyan-400',
  aerial: 'bg-purple-500/20 text-purple-400',
  performance: 'bg-purple-500/20 text-purple-400',
  shooting: 'bg-purple-500/20 text-purple-400',
  review: 'bg-orange-500/20 text-orange-400',
  not_required: 'bg-gray-500/20 text-gray-400',
  signal_interference: 'bg-amber-500/20 text-amber-400',
  fault_alert: 'bg-red-500/20 text-red-400',
  accident: 'bg-orange-500/20 text-orange-400',
  other: 'bg-gray-500/20 text-gray-400',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const label = statusLabelMap[status] ?? status;
  const colorClass = statusColorMap[status] ?? 'bg-gray-500/20 text-gray-400';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass}`}
    >
      {label}
    </span>
  );
}
