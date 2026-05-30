export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isPast(dateString: string): boolean {
  return getDaysUntil(dateString) < 0;
}

export function isToday(dateString: string): boolean {
  return getDaysUntil(dateString) === 0;
}

export function getStatusText(daysUntil: number): string {
  if (daysUntil < 0) return '已过期';
  if (daysUntil === 0) return '今天';
  if (daysUntil === 1) return '明天';
  if (daysUntil <= 7) return `${daysUntil}天后`;
  if (daysUntil <= 30) return `${Math.ceil(daysUntil / 7)}周后`;
  return `${Math.ceil(daysUntil / 30)}个月后`;
}

export function getSubmissionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    preparing: '准备中',
    submitted: '已投稿',
    under_review: '在审',
    accepted: '接受',
    rejected: '拒绝',
    revision_requested: '修改后再投',
  };
  return labels[status] || status;
}

export function getSubmissionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    preparing: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    revision_requested: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getCollaborationPotentialLabel(potential: string): string {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  };
  return labels[potential] || potential;
}

export function getCollaborationPotentialColor(potential: string): string {
  const colors: Record<string, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  };
  return colors[potential] || 'bg-gray-100 text-gray-800';
}

export function getCollaborationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    initial_contact: '初次联系',
    discussion: '讨论中',
    proposal: '提案中',
    active: '进行中',
    completed: '已完成',
    dormant: '搁置',
  };
  return labels[status] || status;
}

export function getCollaborationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    initial_contact: 'bg-blue-100 text-blue-800',
    discussion: 'bg-cyan-100 text-cyan-800',
    proposal: 'bg-purple-100 text-purple-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    dormant: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getExpenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    registration: '注册费',
    travel: '交通',
    accommodation: '住宿',
    food: '餐饮',
    other: '其他',
  };
  return labels[category] || category;
}

export function getTravelTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    flight: '机票',
    hotel: '住宿',
    visa: '签证',
    presentation_time: '报告时间',
    other: '其他',
  };
  return labels[type] || type;
}

export function getChecklistCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    page_limit: '页数限制',
    citation_format: '引用格式',
    figure_requirements: '图表要求',
    other: '其他',
  };
  return labels[category] || category;
}
