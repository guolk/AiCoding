export const facilityTypeMap: Record<string, string> = {
  extinguisher: '灭火器',
  hydrant: '消防栓',
  smoke_alarm: '烟感报警器',
  emergency_light: '应急照明灯',
  exit_sign: '安全出口标志',
};

export const facilityStatusMap: Record<string, { label: string; color: string }> = {
  normal: { label: '正常', color: 'bg-emerald-100 text-emerald-700' },
  abnormal: { label: '异常', color: 'bg-red-100 text-red-700' },
  expired: { label: '过期', color: 'bg-orange-100 text-orange-700' },
  inspecting: { label: '检查中', color: 'bg-blue-100 text-blue-700' },
};

export const hazardStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待整改', color: 'bg-orange-100 text-orange-700' },
  in_progress: { label: '整改中', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已整改', color: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: '已超期', color: 'bg-red-100 text-red-700' },
};

export const planStatusMap: Record<string, { label: string; color: string }> = {
  active: { label: '启用', color: 'bg-emerald-100 text-emerald-700' },
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  archived: { label: '已归档', color: 'bg-orange-100 text-orange-700' },
};

export const evaluationMap: Record<string, { label: string; color: string }> = {
  excellent: { label: '优秀', color: 'bg-emerald-100 text-emerald-700' },
  good: { label: '良好', color: 'bg-blue-100 text-blue-700' },
  average: { label: '一般', color: 'bg-orange-100 text-orange-700' },
  poor: { label: '较差', color: 'bg-red-100 text-red-700' },
};

export const questionTypeMap: Record<string, { label: string; color: string }> = {
  single: { label: '单选题', color: 'bg-blue-100 text-blue-700' },
  multiple: { label: '多选题', color: 'bg-purple-100 text-purple-700' },
  judge: { label: '判断题', color: 'bg-teal-100 text-teal-700' },
};

export const difficultyMap: Record<string, { label: string; color: string }> = {
  easy: { label: '简单', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: '中等', color: 'bg-orange-100 text-orange-700' },
  hard: { label: '困难', color: 'bg-red-100 text-red-700' },
};
