import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import type { Reminder } from '@/types';
import StatusBadge from './StatusBadge';

interface ReminderCardProps {
  reminder: Reminder;
  onClick?: () => void;
  className?: string;
}

export default function ReminderCard({ reminder, onClick, className }: ReminderCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getDaysRemainingText = (days: number, status: string) => {
    if (status === 'expired') {
      return `已过期 ${Math.abs(days)} 天`;
    }
    if (days === 0) return '今天到期';
    if (days === 1) return '明天到期';
    return `${days} 天后到期`;
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'document':
        return '证件';
      case 'legal':
        return '法律';
      case 'family_record':
        return '家庭';
      case 'insurance':
        return '保险';
      default:
        return '其他';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group',
        reminder.status === 'danger' && 'border-red-200 bg-red-50/30',
        reminder.status === 'warning' && 'border-yellow-200 bg-yellow-50/30',
        reminder.status === 'expired' && 'border-gray-300 bg-gray-50/50',
        className
      )}
    >
      <div className='flex items-start gap-3'>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            reminder.status === 'danger' && 'bg-red-100',
            reminder.status === 'warning' && 'bg-yellow-100',
            reminder.status === 'expired' && 'bg-gray-200',
            reminder.status === 'normal' && 'bg-primary-100'
          )}
        >
          {reminder.status === 'danger' || reminder.status === 'warning' ? (
            <AlertTriangle
              className={cn(
                'w-5 h-5',
                reminder.status === 'danger' && 'text-red-600',
                reminder.status === 'warning' && 'text-yellow-600'
              )}
            />
          ) : (
            <Clock
              className={cn(
                'w-5 h-5',
                reminder.status === 'expired' && 'text-gray-600',
                reminder.status === 'normal' && 'text-primary-600'
              )}
            />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <h4 className='font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors'>
              {reminder.title}
            </h4>
            <ChevronRight className='w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0' />
          </div>

          <p className='text-sm text-gray-500 mb-2'>
            {getIconByType(reminder.relatedType)} · {formatDate(reminder.expiryDate)}
          </p>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm'>
              <Calendar className='w-4 h-4 text-gray-400' />
              <span
                className={cn(
                  reminder.status === 'danger' && 'text-red-600 font-medium',
                  reminder.status === 'warning' && 'text-yellow-600',
                  reminder.status === 'expired' && 'text-gray-600',
                  reminder.status === 'normal' && 'text-gray-600'
                )}
              >
                {getDaysRemainingText(reminder.daysRemaining, reminder.status)}
              </span>
            </div>
            <StatusBadge status={reminder.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
