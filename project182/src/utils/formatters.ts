export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

export const getDaysRemaining = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getRSVPStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    declined: 'bg-red-100 text-red-700',
    maybe: 'bg-blue-100 text-blue-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getRSVPStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    confirmed: '已确认',
    pending: '待确认',
    declined: '婉拒',
    maybe: '可能出席',
  };
  return texts[status] || status;
};

export const getInvitationStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    delivered: 'bg-purple-100 text-purple-700',
    opened: 'bg-yellow-100 text-yellow-700',
    responded: 'bg-green-100 text-green-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getInvitationStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    draft: '草稿',
    sent: '已发送',
    delivered: '已送达',
    opened: '已打开',
    responded: '已回复',
  };
  return texts[status] || status;
};

export const getContractStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    signed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getContractStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    draft: '草稿',
    pending: '待签署',
    signed: '已签署',
    completed: '已完成',
  };
  return texts[status] || status;
};

export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getPaymentStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    overdue: '已逾期',
    cancelled: '已取消',
  };
  return texts[status] || status;
};

export const getThankYouStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getThankYouStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    pending: '待发送',
    sent: '已发送',
    completed: '已完成',
  };
  return texts[status] || status;
};

export const getScheduleCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    ceremony: 'bg-accent-100 text-accent-600',
    banquet: 'bg-primary-100 text-primary-600',
    performance: 'bg-champagne-100 text-champagne-600',
    preparation: 'bg-warmGray-100 text-warmGray-600',
    other: 'bg-blue-100 text-blue-600',
  };
  return colors[category] || 'bg-gray-100 text-gray-600';
};

export const getScheduleCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    ceremony: '典礼',
    banquet: '宴席',
    performance: '表演',
    preparation: '准备',
    other: '其他',
  };
  return texts[category] || category;
};

export const getBudgetProgress = (budgeted: number, spent: number): number => {
  if (budgeted === 0) return 0;
  return Math.round((spent / budgeted) * 100);
};

export const isOverBudget = (budgeted: number, spent: number): boolean => {
  return spent > budgeted;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
