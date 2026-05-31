
import { Bell, Wrench, Clock, Shield } from 'lucide-react';
import { Reminder } from '../../types';
import { formatDate, getDaysUntil } from '../../utils/format';

interface ReminderListProps {
  reminders: Reminder[];
}

const ReminderList = ({ reminders }: ReminderListProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-ruby-500';
      case 'medium': return 'bg-gold-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-ink-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'insurance': return <Shield className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getDaysText = (date: string) => {
    const days = getDaysUntil(date);
    if (days < 0) return `已过期 ${Math.abs(days)} 天`;
    if (days === 0) return '今天';
    return `剩余 ${days} 天`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-gold-500" />
        <h2 className="font-display text-xl font-bold text-ink-600">待办提醒</h2>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-8 text-ink-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无待办事项</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-cream-50 hover:bg-gold-50 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-full ${getPriorityColor(reminder.priority)} flex items-center justify-center text-white`}>
                {getTypeIcon(reminder.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-600">{reminder.description}</p>
                <p className="text-sm text-ink-400">{formatDate(reminder.dueDate)}</p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                getDaysUntil(reminder.dueDate) <= 7 ? 'bg-ruby-100 text-ruby-600' : 'bg-gold-100 text-gold-600'
              }`}>
                {getDaysText(reminder.dueDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderList;
