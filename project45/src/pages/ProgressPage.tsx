import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import Button from '@/components/Button';

interface HeatmapDay {
  date: string;
  dayOfWeek: number;
  week: number;
  value: number;
}

interface SessionRecord {
  id: string;
  date: string;
  language: string;
  partnerName: string;
  duration: number;
  type: 'text' | 'voice';
  corrections: number;
  vocabularyAdded: number;
}

function generateHeatmapData(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const week = Math.floor((364 - i) / 7);
    
    const rand = Math.random();
    let value = 0;
    if (rand > 0.4) value = 1;
    if (rand > 0.7) value = 2;
    if (rand > 0.85) value = 3;
    if (rand > 0.95) value = 4;
    
    if (i < 7 || (date.getDay() === 0 || date.getDay() === 6)) {
      value = Math.max(0, value - 1);
    }
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek,
      week,
      value,
    });
  }
  
  return days;
}

const mockSessionRecords: SessionRecord[] = [
  {
    id: 's1',
    date: '2026-05-05',
    language: '日语',
    partnerName: '山田花子',
    duration: 45,
    type: 'voice',
    corrections: 3,
    vocabularyAdded: 5,
  },
  {
    id: 's2',
    date: '2026-05-04',
    language: '英语',
    partnerName: 'Emma Wilson',
    duration: 60,
    type: 'voice',
    corrections: 5,
    vocabularyAdded: 8,
  },
  {
    id: 's3',
    date: '2026-05-03',
    language: '日语',
    partnerName: '山田花子',
    duration: 25,
    type: 'text',
    corrections: 2,
    vocabularyAdded: 3,
  },
  {
    id: 's4',
    date: '2026-05-01',
    language: '英语',
    partnerName: 'Emma Wilson',
    duration: 30,
    type: 'text',
    corrections: 1,
    vocabularyAdded: 2,
  },
  {
    id: 's5',
    date: '2026-04-29',
    language: '日语',
    partnerName: '山田花子',
    duration: 50,
    type: 'voice',
    corrections: 4,
    vocabularyAdded: 6,
  },
];

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatmapCalendar() {
  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  
  const valueColors: Record<number, string> = {
    0: 'bg-gray-100',
    1: 'bg-green-200',
    2: 'bg-green-300',
    3: 'bg-green-400',
    4: 'bg-green-500',
  };
  
  const valueLabels: Record<number, string> = {
    0: '无活动',
    1: '轻度学习',
    2: '中度学习',
    3: '大量学习',
    4: '高强度学习',
  };

  const weeks: HeatmapDay[][] = [];
  heatmapData.forEach((day) => {
    if (!weeks[day.week]) {
      weeks[day.week] = [];
    }
    weeks[day.week][day.dayOfWeek] = day;
  });

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];
  const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const today = new Date();
  const currentMonth = today.getMonth();
  const displayedMonths = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 11 + i + 12) % 12;
    displayedMonths.push(monthLabels[monthIndex]);
  }

  const stats = useMemo(() => {
    const totalDays = heatmapData.length;
    const activeDays = heatmapData.filter((d) => d.value > 0).length;
    const streak = calculateCurrentStreak(heatmapData);
    const maxStreak = calculateMaxStreak(heatmapData);
    return { activeDays, totalDays, streak, maxStreak };
  }, [heatmapData]);

  function calculateCurrentStreak(days: HeatmapDay[]): number {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].value > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  function calculateMaxStreak(days: HeatmapDay[]): number {
    let maxStreak = 0;
    let currentStreak = 0;
    days.forEach((day) => {
      if (day.value > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    return maxStreak;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">学习活动热图</h3>
          <p className="text-sm text-gray-500 mt-1">过去一年的学习活动记录</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>连续学习</span>
            <span className="text-lg font-bold text-green-600">{stats.streak}</span>
            <span>天</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span>活跃天数</span>
            <span className="text-lg font-bold text-indigo-600">
              {stats.activeDays}
            </span>
            <span>/{stats.totalDays}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-1 mb-2 pl-8">
          {displayedMonths.map((month, idx) => (
            <span key={idx} className="text-xs text-gray-400 w-16 text-center">
              {month}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-2">
            {dayLabels.map((day, idx) => (
              <span
                key={idx}
                className="text-xs text-gray-400 h-3 flex items-center justify-end pr-1"
              >
                {idx % 2 === 0 ? day : ''}
              </span>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {dayLabels.map((_, dayIdx) => {
                  const day = week?.[dayIdx];
                  return (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125 ${
                        day ? valueColors[day.value] : 'bg-gray-50'
                      }`}
                      onMouseEnter={() => day && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={day ? `${day.date}: ${valueLabels[day.value]}` : ''}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
          <span>少</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${valueColors[level]}`}
            />
          ))}
          <span>多</span>
        </div>

        {hoveredDay && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10">
            <p className="font-medium">{hoveredDay.date}</p>
            <p className="text-gray-300 mt-1">{valueLabels[hoveredDay.value]}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LanguageProgressChart() {
  const languages = [
    { name: '英语', level: '中级', progress: 65, target: '高级' },
    { name: '日语', level: '初级', progress: 35, target: '中级' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">语言学习进度</h3>
      <div className="space-y-6">
        {languages.map((lang, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{lang.name}</span>
                <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                  {lang.level}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {lang.progress}% → {lang.target}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${lang.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionRecordTable({ records }: { records: SessionRecord[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">最近会话记录</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                语言
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                语言伙伴
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时长
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                纠正
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                生词
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                    {record.language}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.partnerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      record.type === 'voice'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {record.type === 'voice' ? '🎤 语音' : '💬 文字'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.duration}分钟
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.corrections}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.vocabularyAdded}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <Button variant="ghost" size="sm" className="text-sm">
          查看全部记录 →
        </Button>
      </div>
    </div>
  );
}

export function ProgressPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学习进度</h1>
          <p className="text-gray-500 mt-1">追踪您的语言学习历程</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="本周学习时长"
            value="5小时45分"
            subtitle="目标: 10小时"
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="今日会话"
            value="3次"
            subtitle="45分钟"
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <StatCard
            title="收到纠正"
            value="12次"
            subtitle="本周"
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <StatCard
            title="新增生词"
            value="24个"
            subtitle="已掌握: 18个"
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>

        <HeatmapCalendar />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SessionRecordTable records={mockSessionRecords} />
          </div>
          <div className="lg:col-span-1">
            <LanguageProgressChart />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProgressPage;
