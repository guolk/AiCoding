interface StatusBadgeProps {
  status: string;
  type?: 'project' | 'task' | 'milestone' | 'reading' | 'achievement';
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  proposed: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '立项中' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: '进行中' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: '已完成' },
  published: { bg: 'bg-purple-100', text: 'text-purple-700', label: '已发表' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: '待处理' },
  todo: { bg: 'bg-gray-100', text: 'text-gray-700', label: '待办' },
  done: { bg: 'bg-green-100', text: 'text-green-700', label: '已完成' },
  unread: { bg: 'bg-gray-100', text: 'text-gray-700', label: '未读' },
  reading: { bg: 'bg-blue-100', text: 'text-blue-700', label: '阅读中' },
  finished: { bg: 'bg-green-100', text: 'text-green-700', label: '已读完' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: '草稿' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: '已提交' },
  reviewing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '评审中' },
  accepted: { bg: 'bg-green-100', text: 'text-green-700', label: '已录用' },
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  return (
    <span className={`status-badge ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
