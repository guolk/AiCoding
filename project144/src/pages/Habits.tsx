import { useState, useMemo } from 'react';
import {
  CalendarCheck,
  KeyRound,
  Shield,
  Database,
  Plus,
  CheckCircle,
  Clock,
  Bell,
  TrendingUp,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Layout, Modal, Badge, EmptyState, StatCard } from '@/components';
import type { SecurityHabit, HabitType, Account } from '@/types';
import { cn } from '@/lib/utils';

const habitTypeConfig: Record<
  HabitType,
  { label: string; icon: typeof KeyRound; color: string; bgColor: string }
> = {
  password_change: {
    label: '密码更换',
    icon: KeyRound,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  '2fa_check': {
    label: '2FA检查',
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  backup: {
    label: '数据备份',
    icon: Database,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
};

const securityTips = [
  {
    id: '1',
    icon: Shield,
    title: '开启双因素认证',
    description: '为所有重要账号开启2FA，即使密码泄露也能保护账号安全。',
  },
  {
    id: '2',
    icon: KeyRound,
    title: '使用密码管理器',
    description: '使用密码管理器生成和存储强密码，避免重复使用密码。',
  },
  {
    id: '3',
    icon: Database,
    title: '定期备份数据',
    description: '每月至少备份一次重要数据，确保数据不会意外丢失。',
  },
  {
    id: '4',
    icon: Bell,
    title: '关注安全通知',
    description: '及时关注数据泄露通知，发现泄露后立即更换密码。',
  },
];

interface HabitCardProps {
  habit: SecurityHabit;
  account?: Account;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function HabitCard({ habit, account, onComplete, onDelete }: HabitCardProps) {
  const config = habitTypeConfig[habit.type];
  const Icon = config.icon;
  const now = new Date();
  const nextReminder = new Date(habit.nextReminder);
  const daysUntil = Math.ceil(
    (nextReminder.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil <= 7 && daysUntil >= 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'p-5 rounded-xl border transition-all hover:shadow-md',
        isOverdue
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : isUrgent
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}>
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {config.label}
            </h3>
            {account && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {account.platformName}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant={isOverdue ? 'danger' : isUrgent ? 'warning' : 'success'}
          size="sm"
        >
          {isOverdue
            ? `已过期 ${Math.abs(daysUntil)} 天`
            : daysUntil === 0
            ? '今天到期'
            : `还剩 ${daysUntil} 天`}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-sm">
          <p className="text-gray-500 dark:text-gray-400">上次完成</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(habit.lastCompleted)}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500 dark:text-gray-400">下次提醒</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(habit.nextReminder)}
          </p>
        </div>
        <div className="text-sm col-span-2">
          <p className="text-gray-500 dark:text-gray-400">提醒间隔</p>
          <p className="font-medium text-gray-900 dark:text-white">
            每 {habit.intervalDays} 天
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onComplete(habit.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          打卡完成
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface CalendarViewProps {
  habits: SecurityHabit[];
  accounts: Account[];
}

function CalendarView({ habits, accounts }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const now = new Date();

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getHabitsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return habits.filter((habit) => {
      const reminderDate = new Date(habit.nextReminder);
      return reminderDate.toDateString() === dateStr;
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === now.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const days: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          30天提醒日历
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-medium text-gray-900 dark:text-white min-w-[120px] text-center">
            {currentDate.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
            })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-1" />;
          }
          const dayHabits = getHabitsForDate(date);
          const today = isToday(date);
          const past = isPast(date);

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'p-1 min-h-[60px] rounded-lg border transition-colors',
                today
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : past
                  ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div
                className={cn(
                  'text-xs font-medium mb-1',
                  today
                    ? 'text-blue-600 dark:text-blue-400'
                    : past
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayHabits.slice(0, 2).map((habit) => {
                  const config = habitTypeConfig[habit.type];
                  const account = habit.accountId
                    ? accounts.find((a) => a.id === habit.accountId)
                    : undefined;
                  return (
                    <div
                      key={habit.id}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded truncate',
                        config.bgColor,
                        config.color
                      )}
                      title={account ? `${config.label} - ${account.platformName}` : config.label}
                    >
                      {account ? account.platformName : config.label}
                    </div>
                  );
                })}
                {dayHabits.length > 2 && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    +{dayHabits.length - 2} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAdd: (habit: Omit<SecurityHabit, 'id'>) => void;
}

function AddHabitModal({ isOpen, onClose, accounts, onAdd }: AddHabitModalProps) {
  const [type, setType] = useState<HabitType>('password_change');
  const [accountId, setAccountId] = useState<string>('');
  const [intervalDays, setIntervalDays] = useState(90);

  const handleSubmit = () => {
    const now = new Date();
    const nextReminder = new Date(now);
    nextReminder.setDate(nextReminder.getDate() + intervalDays);

    onAdd({
      type,
      accountId: type === 'backup' ? undefined : accountId,
      lastCompleted: now.toISOString(),
      nextReminder: nextReminder.toISOString(),
      intervalDays,
      enabled: true,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="添加安全习惯"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={type !== 'backup' && !accountId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            习惯类型
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(habitTypeConfig) as HabitType[]).map((t) => {
              const config = habitTypeConfig[t];
              const Icon = config.icon;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all text-center',
                    type === t
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 mx-auto mb-1',
                      type === t ? config.color : 'text-gray-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      type === t
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {type !== 'backup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              关联账号
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择账号</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.platformName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            提醒间隔（天）
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="365"
              value={intervalDays}
              onChange={(e) => setIntervalDays(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="1"
              max="365"
              value={intervalDays}
              onChange={(e) => setIntervalDays(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[7, 30, 90, 180].map((days) => (
              <button
                key={days}
                onClick={() => setIntervalDays(days)}
                className={cn(
                  'px-3 py-1 text-xs rounded-lg transition-colors',
                  intervalDays === days
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {days}天
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Habits() {
  const { habits, accounts, addHabit, completeHabit, deleteHabit, getSecurityScore } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const securityScore = useMemo(() => getSecurityScore(), [getSecurityScore]);

  const stats = useMemo(() => {
    const now = new Date();
    const total = habits.length;
    const completed = habits.filter((h) => {
      const nextReminder = new Date(h.nextReminder);
      return nextReminder > now;
    }).length;
    const overdue = habits.filter((h) => {
      const nextReminder = new Date(h.nextReminder);
      return nextReminder < now;
    }).length;
    const upcoming = habits.filter((h) => {
      const nextReminder = new Date(h.nextReminder);
      const daysUntil = Math.ceil(
        (nextReminder.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil >= 0 && daysUntil <= 7;
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, upcoming, completionRate };
  }, [habits]);

  const handleAddHabit = (habit: Omit<SecurityHabit, 'id'>) => {
    addHabit(habit);
  };

  const handleCompleteHabit = (id: string) => {
    completeHabit(id);
  };

  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
  };

  const getAccount = (accountId?: string) => {
    return accountId ? accounts.find((a) => a.id === accountId) : undefined;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              安全习惯
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              培养良好的安全习惯，保护您的数字资产
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加习惯
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="习惯总数"
            value={stats.total}
            icon={CalendarCheck}
            variant="primary"
          />
          <StatCard
            title="完成率"
            value={stats.completionRate}
            icon={Award}
            variant="success"
            suffix="%"
            trend={{ value: 5, label: '较上周', isPositive: true }}
          />
          <StatCard
            title="即将到期"
            value={stats.upcoming}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="已过期"
            value={stats.overdue}
            icon={Bell}
            variant="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                完成率统计
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      习惯合规率
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {securityScore.habitCompliance}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${securityScore.habitCompliance}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {habits.filter((h) => h.type === 'password_change').length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      密码更换
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {habits.filter((h) => h.type === '2fa_check').length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      2FA检查
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {habits.filter((h) => h.type === 'backup').length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      数据备份
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                安全习惯列表
              </h2>
              {habits.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="暂无安全习惯"
                  description="添加您的第一个安全习惯，开始保护您的数字资产"
                  action={
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加习惯
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      account={getAccount(habit.accountId)}
                      onComplete={handleCompleteHabit}
                      onDelete={handleDeleteHabit}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <CalendarView habits={habits} accounts={accounts} />

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                安全建议
              </h3>
              <div className="space-y-4">
                {securityTips.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div
                      key={tip.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <AddHabitModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          accounts={accounts}
          onAdd={handleAddHabit}
        />
      </div>
    </Layout>
  );
}
