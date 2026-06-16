import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Minus,
  SkipForward,
  TrendingUp,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useHealthStore } from '@/store';
import type { AdherenceStatus, AdherenceRecord } from '@/types';
import { cn, formatDate } from '@/utils';

const statusColors: Record<AdherenceStatus, string> = {
  taken: 'bg-green-500',
  partial: 'bg-yellow-500',
  missed: 'bg-red-500',
  skipped: 'bg-gray-400',
};

const statusBgColors: Record<AdherenceStatus, string> = {
  taken: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  missed: 'bg-red-100 text-red-700',
  skipped: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<AdherenceStatus, string> = {
  taken: '已服',
  partial: '部分',
  missed: '漏服',
  skipped: '跳过',
};

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

export default function AdherenceTracker() {
  const { medications, adherenceRecords, addAdherence, updateAdherence } = useHealthStore();
  const today = new Date('2026-06-15');
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const activeMedications = useMemo(() => medications.filter((m) => m.isActive), [medications]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const getDayStatus = (date: Date): AdherenceStatus | null => {
    if (activeMedications.length === 0) return null;
    const dateStr = formatDate(date);
    const dayRecords = adherenceRecords.filter((r) => r.date === dateStr);
    if (dayRecords.length === 0) return null;

    const statuses = dayRecords.map((r) => r.status);
    if (statuses.every((s) => s === 'taken')) return 'taken';
    if (statuses.every((s) => s === 'missed')) return 'missed';
    if (statuses.every((s) => s === 'skipped')) return 'skipped';
    if (statuses.includes('missed')) return 'partial';
    if (statuses.includes('partial')) return 'partial';
    return 'taken';
  };

  const calculateAdherenceRate = (records: AdherenceRecord[]) => {
    if (records.length === 0) return 0;
    const taken = records.filter((r) => r.status === 'taken').length;
    const partial = records.filter((r) => r.status === 'partial').length;
    return Number((((taken + partial * 0.5) / records.length) * 100).toFixed(1));
  };

  const weekRate = useMemo(() => {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRecords = adherenceRecords.filter((r) => {
      const d = new Date(r.date);
      return d >= weekAgo && d <= today;
    });
    return calculateAdherenceRate(weekRecords);
  }, [adherenceRecords]);

  const monthRate = useMemo(() => {
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthRecords = adherenceRecords.filter((r) => {
      const d = new Date(r.date);
      return d >= monthAgo && d <= today;
    });
    return calculateAdherenceRate(monthRecords);
  }, [adherenceRecords]);

  const perMedicationRate = useMemo(() => {
    return activeMedications.map((med) => {
      const medRecords = adherenceRecords.filter((r) => r.medicationId === med.id);
      return {
        medication: med,
        rate: calculateAdherenceRate(medRecords),
      };
    });
  }, [activeMedications, adherenceRecords]);

  const trendData = useMemo(() => {
    const data: { date: string; rate: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayRecords = adherenceRecords.filter((r) => r.date === dateStr);
      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        rate: calculateAdherenceRate(dayRecords),
      });
    }
    return data;
  }, [adherenceRecords]);

  const todayStr = formatDate(today);
  const todayRecords = useMemo(
    () => activeMedications.map((med) => {
      const record = adherenceRecords.find(
        (r) => r.date === todayStr && r.medicationId === med.id
      );
      return { medication: med, record };
    }),
    [activeMedications, adherenceRecords, todayStr]
  );

  const handleStatusToggle = (medicationId: string, currentStatus: AdherenceStatus | undefined) => {
    const nextStatus: AdherenceStatus =
      currentStatus === 'taken' ? 'missed' : currentStatus === 'missed' ? 'skipped' : 'taken';

    const existingRecord = adherenceRecords.find(
      (r) => r.date === todayStr && r.medicationId === medicationId
    );

    if (existingRecord) {
      updateAdherence(existingRecord.id, { status: nextStatus });
    } else {
      addAdherence({
        date: todayStr,
        medicationId,
        status: nextStatus,
        takenTimes: nextStatus === 'taken' ? [formatDate(today)] : undefined,
      });
    }
  };

  const days = getDaysInMonth(currentMonth);
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const StatusIcon = ({ status }: { status: AdherenceStatus }) => {
    if (status === 'taken') return <Check className="h-3 w-3" />;
    if (status === 'missed') return <X className="h-3 w-3" />;
    if (status === 'skipped') return <SkipForward className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            本周依从率
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{weekRate}</span>
            <span className="text-lg text-gray-500">%</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            本月依从率
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{monthRate}</span>
            <span className="text-lg text-gray-500">%</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-4 w-4 rounded-full bg-green-500" />
            在服药物
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{activeMedications.length}</span>
            <span className="text-lg text-gray-500">种</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">今日服药打卡</h3>
        {todayRecords.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">暂无在服药物</p>
        ) : (
          <div className="space-y-2">
            {todayRecords.map(({ medication, record }) => (
              <div
                key={medication.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{medication.name}</p>
                  <p className="text-xs text-gray-500">{medication.dosage}</p>
                </div>
                <button
                  onClick={() => handleStatusToggle(medication.id, record?.status)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    record?.status
                      ? statusBgColors[record.status]
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  )}
                >
                  {record?.status ? (
                    <>
                      <StatusIcon status={record.status} />
                      {statusLabels[record.status]}
                    </>
                  ) : (
                    '点击打卡'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
          </h3>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="py-1 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            const isCurrentMonthDay = date.getMonth() === currentMonth.getMonth();
            const isToday =
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate();
            const status = getDayStatus(date);
            const isFuture = date > today;

            return (
              <div
                key={idx}
                className={cn(
                  'relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm',
                  !isCurrentMonthDay && 'opacity-40',
                  isToday && 'ring-2 ring-blue-500',
                  isFuture && 'opacity-30'
                )}
              >
                <span
                  className={cn(
                    'z-10',
                    isToday ? 'font-bold text-blue-600' : 'text-gray-700'
                  )}
                >
                  {date.getDate()}
                </span>
                {status && !isFuture && (
                  <span
                    className={cn(
                      'mt-0.5 h-1.5 w-1.5 rounded-full',
                      statusColors[status]
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          {(['taken', 'partial', 'missed', 'skipped'] as AdherenceStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn('h-3 w-3 rounded-full', statusColors[status])} />
              <span className="text-gray-600">{statusLabels[status]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">近30天依从率趋势</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, '依从率']}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">各药物依从率</h3>
        {perMedicationRate.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">暂无在服药物</p>
        ) : (
          <div className="space-y-3">
            {perMedicationRate.map(({ medication, rate }) => (
              <div key={medication.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{medication.name}</span>
                  <span
                    className={cn(
                      'font-medium',
                      rate >= 80
                        ? 'text-green-600'
                        : rate >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    )}
                  >
                    {rate}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      rate >= 80
                        ? 'bg-green-500'
                        : rate >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
