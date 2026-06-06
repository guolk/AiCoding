export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysSince = (dateString: string): number => {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateVolume = (length: number, width: number, height: number): number => {
  return Math.round((length * width * height) / 1000);
};

export const checkWaterParameter = (
  param: string,
  value: number
): { status: 'normal' | 'warning' | 'danger'; message: string } => {
  const ranges: Record<string, { min: number; max: number; warning?: { min: number; max: number } }> = {
    ph: { min: 6.5, max: 7.5, warning: { min: 6.0, max: 8.0 } },
    ammonia: { min: 0, max: 0.25, warning: { min: 0, max: 0.5 } },
    nitrite: { min: 0, max: 0.3, warning: { min: 0, max: 0.5 } },
    nitrate: { min: 0, max: 20, warning: { min: 0, max: 40 } },
    gh: { min: 4, max: 12, warning: { min: 2, max: 16 } },
    kh: { min: 3, max: 8, warning: { min: 1, max: 12 } },
  };

  const range = ranges[param];
  if (!range) return { status: 'normal', message: '参数正常' };

  if (value < range.min || value > range.max) {
    if (range.warning && (value < range.warning.min || value > range.warning.max)) {
      return { status: 'danger', message: `${param.toUpperCase()} 严重超标` };
    }
    return { status: 'warning', message: `${param.toUpperCase()} 超出正常范围` };
  }

  return { status: 'normal', message: '参数正常' };
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    healthy: 'bg-reef-100 text-reef-700',
    growing: 'bg-aqua-100 text-aqua-700',
    melting: 'bg-coral-100 text-coral-700',
    dead: 'bg-gray-100 text-gray-600',
    observing: 'bg-yellow-100 text-yellow-700',
    sick: 'bg-coral-100 text-coral-700',
    running: 'bg-reef-100 text-reef-700',
    cycling: 'bg-aqua-100 text-aqua-700',
    offline: 'bg-gray-100 text-gray-600',
    low: 'bg-yellow-100 text-yellow-700',
    medium: 'bg-coral-100 text-coral-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
    detected: 'bg-yellow-100 text-yellow-700',
    analyzing: 'bg-aqua-100 text-aqua-700',
    treating: 'bg-coral-100 text-coral-700',
    verified: 'bg-reef-100 text-reef-700',
    resolved: 'bg-gray-100 text-gray-600',
    recovered: 'bg-reef-100 text-reef-700',
    ongoing: 'bg-coral-100 text-coral-700',
    deceased: 'bg-gray-100 text-gray-600',
    normal: 'bg-reef-100 text-reef-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    healthy: '健康',
    growing: '生长中',
    melting: '融叶',
    dead: '死亡',
    observing: '观察中',
    sick: '生病',
    running: '运行中',
    cycling: '养水中',
    offline: '已停用',
    low: '轻微',
    medium: '中等',
    high: '严重',
    critical: '紧急',
    detected: '已发现',
    analyzing: '分析中',
    treating: '处理中',
    verified: '已验证',
    resolved: '已解决',
    recovered: '已康复',
    ongoing: '治疗中',
    deceased: '已死亡',
    normal: '正常',
    warning: '警告',
    danger: '危险',
    new_leaf: '新叶',
    propagation: '繁殖',
    flowering: '开花',
    pruning: '修剪',
  };
  return texts[status] || status;
};

export const getGrowthEventTypeText = (type: string): string => {
  const texts: Record<string, string> = {
    new_leaf: '新叶生长',
    propagation: '植株增殖',
    flowering: '开花',
    melting: '融叶',
    pruning: '修剪',
  };
  return texts[type] || type;
};

export const getTreatmentStageText = (stage: string): string => {
  const texts: Record<string, string> = {
    detection: '发现问题',
    analysis: '分析原因',
    action: '采取措施',
    verification: '效果验证',
  };
  return texts[stage] || stage;
};
