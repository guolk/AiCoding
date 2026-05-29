import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { Card } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import {
  ChevronLeft,
  BarChart3,
  Download,
  TrendingUp,
  Heart,
  Target,
  Calendar,
  Award,
  Sparkles,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#FF6B35', '#1A365D', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'];

export default function Visualize() {
  const { year } = useParams();
  const navigate = useNavigate();
  const { data, currentYear, setCurrentYear } = useYearlyReviewStore();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [activeTheme, setActiveTheme] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const themes = [
    { name: '温暖橙', bg: 'from-primary-500 to-primary-600', accent: 'bg-primary-400' },
    { name: '深邃蓝', bg: 'from-secondary-500 to-secondary-700', accent: 'bg-secondary-400' },
    { name: '清新绿', bg: 'from-emerald-500 to-teal-600', accent: 'bg-emerald-400' },
    { name: '优雅紫', bg: 'from-violet-500 to-purple-600', accent: 'bg-violet-400' },
  ];

  useEffect(() => {
    if (year) {
      setCurrentYear(parseInt(year));
    }
  }, [year, setCurrentYear]);

  const displayYear = year ? parseInt(year) : currentYear;
  const yearData = data[displayYear];

  const statFields = [
    { key: 'booksRead', label: '阅读书籍', icon: '📚' },
    { key: 'exerciseCount', label: '运动次数', icon: '💪' },
    { key: 'skillsLearned', label: '学习技能', icon: '🎓' },
    { key: 'travelPlaces', label: '旅行地点', icon: '✈️' },
    { key: 'moviesWatched', label: '观影数量', icon: '🎬' },
    { key: 'habitsStarted', label: '养成习惯', icon: '✨' },
  ];

  const chartData = statFields
    .map(field => ({
      name: field.label,
      value: (yearData?.review.statistics[field.key as keyof typeof yearData.review.statistics] as number) || 0,
      icon: field.icon,
    }))
    .filter(d => d.value > 0);

  const goalByCategory = yearData?.plan.goals.reduce((acc, goal) => {
    acc[goal.category] = (acc[goal.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const goalChartData = Object.entries(goalByCategory).map(([category, count]) => ({
    name: category,
    value: count,
  }));

  const highlights = yearData?.gratitude.achievements.filter(a => a.isHighlight) || [];
  const gratitudeItems = yearData?.gratitude.gratitudeItems || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-secondary-500">
            可视化总结
          </h1>
          <p className="text-gray-500 mt-1">
            {displayYear} 年 - 生成精美的年度总结
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {chartData.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="font-display text-lg font-semibold text-secondary-500">
                年度数据分布
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} 项`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-semibold text-secondary-500 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {goalChartData.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-secondary-500" />
              <h3 className="font-display text-lg font-semibold text-secondary-500">
                目标分布
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-display text-lg font-semibold text-secondary-500">
              关键指标
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <span className="text-gray-600">目标数量</span>
              <span className="text-2xl font-bold text-primary-600">
                {yearData?.plan.goals.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <span className="text-gray-600">成就记录</span>
              <span className="text-2xl font-bold text-secondary-600">
                {yearData?.gratitude.achievements.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
              <span className="text-gray-600">感恩事项</span>
              <span className="text-2xl font-bold text-pink-600">
                {gratitudeItems.length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h3 className="font-display text-xl font-semibold text-secondary-500">
              年度总结卡片
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {themes.map((theme, index) => (
                <button
                  key={theme.name}
                  onClick={() => setActiveTheme(index)}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.bg} ${
                    activeTheme === index ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                  }`}
                  title={theme.name}
                />
              ))}
            </div>
            <Button
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => setIsExporting(true)}
            >
              下载图片
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            ref={cardRef}
            className={`w-full max-w-md aspect-[3/4] rounded-2xl bg-gradient-to-br ${themes[activeTheme].bg} p-8 text-white shadow-2xl`}
          >
            <div className="h-full flex flex-col">
              <div className="text-center mb-6">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <h2 className="font-display text-4xl font-bold">{displayYear}</h2>
                <p className="text-white/80 text-sm mt-1">年度回顾与计划</p>
              </div>

              {highlights.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold text-sm">年度亮点</span>
                  </div>
                  <div className="space-y-2">
                    {highlights.slice(0, 3).map((h, i) => (
                      <div key={i} className="bg-white/10 rounded-lg p-2 text-sm">
                        {h.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gratitudeItems.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4" />
                    <span className="font-semibold text-sm">感恩之事</span>
                  </div>
                  <div className="space-y-1">
                    {gratitudeItems.slice(0, 3).map((g, i) => (
                      <div key={i} className="text-sm text-white/90">
                        • {g.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {yearData?.plan.goals.length > 0 && (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      {displayYear + 1} 年目标
                    </span>
                  </div>
                  <div className="space-y-1">
                    {yearData.plan.goals.slice(0, 3).map((g, i) => (
                      <div key={i} className="text-sm text-white/90">
                        • {g.title}
                      </div>
                    ))}
                    {yearData.plan.goals.length > 3 && (
                      <div className="text-sm text-white/60">
                        还有 {yearData.plan.goals.length - 3} 个目标...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/20 text-center">
                <p className="text-sm text-white/70">
                  记录成长，规划未来
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/plan/${displayYear}`)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          返回新年计划
        </Button>
        <Button
          onClick={() => navigate(`/export/${displayYear}`)}
          rightIcon={<Download className="w-4 h-4" />}
        >
          导出报告
        </Button>
      </div>
    </div>
  );
}
