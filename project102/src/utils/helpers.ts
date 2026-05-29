import type {
  EquipmentStatus,
  DocumentType,
  InspectionFrequency,
  TaskStatus,
  UrgencyLevel,
  WorkOrderStatus,
} from '@/types';

export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const equipmentStatusConfig: Record<EquipmentStatus, { label: string; color: string; bgColor: string }> = {
  running: { label: '运行中', color: 'text-green-700', bgColor: 'bg-green-100' },
  standby: { label: '待机', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  maintenance: { label: '维修中', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  fault: { label: '故障', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const documentTypeConfig: Record<DocumentType, { label: string }> = {
  manual: { label: '说明书' },
  certificate: { label: '合格证' },
  drawing: { label: '图纸' },
  other: { label: '其他' },
};

export const frequencyConfig: Record<InspectionFrequency, { label: string }> = {
  daily: { label: '每日' },
  weekly: { label: '每周' },
  monthly: { label: '每月' },
  quarterly: { label: '每季度' },
};

export const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待执行', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  completed: { label: '已完成', color: 'text-green-700', bgColor: 'bg-green-100' },
  overdue: { label: '已逾期', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string; order: number }> = {
  low: { label: '低', color: 'text-gray-700', bgColor: 'bg-gray-100', order: 1 },
  medium: { label: '中', color: 'text-yellow-700', bgColor: 'bg-yellow-100', order: 2 },
  high: { label: '高', color: 'text-orange-700', bgColor: 'bg-orange-100', order: 3 },
  urgent: { label: '紧急', color: 'text-red-700', bgColor: 'bg-red-100', order: 4 },
};

export const workOrderStatusConfig: Record<WorkOrderStatus, { label: string; color: string; bgColor: string; order: number }> = {
  pending: { label: '待派工', color: 'text-yellow-700', bgColor: 'bg-yellow-100', order: 1 },
  assigned: { label: '已派工', color: 'text-blue-700', bgColor: 'bg-blue-100', order: 2 },
  processing: { label: '处理中', color: 'text-indigo-700', bgColor: 'bg-indigo-100', order: 3 },
  completed: { label: '已完成', color: 'text-green-700', bgColor: 'bg-green-100', order: 4 },
  closed: { label: '已关闭', color: 'text-gray-700', bgColor: 'bg-gray-100', order: 5 },
};

export const cn = (...classes: (string | false | null | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
