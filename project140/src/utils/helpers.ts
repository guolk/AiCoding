import { format, formatDistanceToNow, differenceInHours, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd') => {
  return format(new Date(date), pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatRelative = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

export const hoursUntil = (date: string | Date) => {
  return differenceInHours(new Date(date), new Date());
};

export const daysUntil = (date: string | Date) => {
  return differenceInDays(new Date(date), new Date());
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'idea': 'bg-blue-100 text-blue-800',
    'evaluating': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'invited': 'bg-purple-100 text-purple-800',
    'negotiating': 'bg-orange-100 text-orange-800',
    'confirmed': 'bg-green-100 text-green-800',
    'declined': 'bg-red-100 text-red-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'pending': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-purple-100 text-purple-800',
    'draft': 'bg-gray-100 text-gray-800',
    'published': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'planning': 'bg-indigo-100 text-indigo-800',
    'recording': 'bg-orange-100 text-orange-800',
    'editing': 'bg-purple-100 text-purple-800',
    'archived': 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'idea': '创意阶段',
    'evaluating': '评估中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'invited': '已邀请',
    'negotiating': '沟通中',
    'confirmed': '已确认',
    'declined': '已谢绝',
    'scheduled': '已预约',
    'completed': '已完成',
    'cancelled': '已取消',
    'pending': '待处理',
    'in_progress': '进行中',
    'review': '审核中',
    'draft': '草稿',
    'published': '已发布',
    'failed': '发布失败',
    'planning': '策划中',
    'recording': '录制中',
    'editing': '剪辑中',
    'archived': '已归档',
    'original': '原始录音',
    'edited': '剪辑版',
    'final': '最终版',
    'positive': '正面',
    'neutral': '中性',
    'negative': '负面',
  };
  return labelMap[status] || status;
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
