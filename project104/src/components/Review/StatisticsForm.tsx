import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { StatisticsData } from '@/types';
import {
  BookOpen,
  Dumbbell,
  GraduationCap,
  Plane,
  Film,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const statFields: {
  key: keyof StatisticsData;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}[] = [
  { key: 'booksRead', label: '阅读书籍', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'exerciseCount', label: '运动次数', icon: Dumbbell, color: 'text-green-600', bgColor: 'bg-green-100' },
  { key: 'skillsLearned', label: '学习技能', icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { key: 'travelPlaces', label: '旅行地点', icon: Plane, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { key: 'moviesWatched', label: '观影数量', icon: Film, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { key: 'habitsStarted', label: '养成习惯', icon: Sparkles, color: 'text-amber-600', bgColor: 'bg-amber-100' },
];

const COLORS = ['#FF6B35', '#1A365D', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'];

export function StatisticsForm() {
  const { data, currentYear, updateStatistics } = useYearlyReviewStore();
  const yearData = data[currentYear];
  const statistics = yearData?.review.statistics;

  const handleChange = (key: keyof StatisticsData, value: number) => {
    updateStatistics({ [key]: Math.max(0, value) });
  };

  const chartData = statFields.map((field) => ({
    name: field.label,
    value: (statistics?.[field.key] as number) || 0,
  })).filter(d => d.value > 0);

  const totalStats = statFields.reduce((sum, field) => {
    return sum + ((statistics?.[field.key] as number) || 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-xl font-semibold text-secondary-500 mb-2">
          年度数据统计
        </h3>
        <p className="text-gray-500 text-sm">用数字记录这一年的收获</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {statFields.map((field) => {
            const Icon = field.icon;
            const value = (statistics?.[field.key] as number) || 0;

            return (
              <div
                key={field.key}
                className="bg-white rounded-xl p-4 border border-warm-200/50 shadow-sm
                           hover:shadow-md transition-all duration-200"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', field.bgColor)}>
                  <Icon className={cn('w-5 h-5', field.color)} />
                </div>
                
                <div className="flex items-baseline gap-1 mb-2">
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => handleChange(field.key, parseInt(e.target.value) || 0)}
                    className={cn(
                      'w-20 text-2xl font-bold bg-transparent border-b-2 border-transparent',
                      'focus:border-primary-400 focus:outline-none transition-colors',
                      field.color
                    )}
                  />
                </div>
                
                <p className="text-sm text-gray-500">{field.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl p-6 border border-warm-200/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-primary-500" />
            <h4 className="font-semibold text-secondary-500">数据分布</h4>
          </div>
          
          {chartData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} 项`, '数量']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-1.5">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-secondary-500">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <BarChart2 className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">暂无数据</p>
            </div>
          )}
        </div>
      </div>

      {totalStats > 0 && (
        <div className="p-6 bg-gradient-to-r from-primary-50 to-warm-100 rounded-xl">
          <p className="text-center">
            <span className="text-4xl font-bold text-primary-500 mr-2">{totalStats}</span>
            <span className="text-secondary-500 font-medium">项成就记录在案</span>
          </p>
        </div>
      )}
    </div>
  );
}
