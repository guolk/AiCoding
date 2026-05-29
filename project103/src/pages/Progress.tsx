import React, { useMemo } from 'react';
import { 
  Clock, 
  Target, 
  Trophy, 
  TrendingUp,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useMaterialStore, useProgressStore, usePracticeStore } from '../stores';
import { formatTime } from '../utils';
import { MaterialTypeLabels } from '../types';

export const Progress: React.FC = () => {
  const { materials } = useMaterialStore();
  const { 
    getTotalPracticeTime, 
    getAverageAccuracy, 
    getCompletedCount,
    getStatsForLastNDays 
  } = useProgressStore();
  const { getMostWrongWords, wrongWords, practiceRecords } = usePracticeStore();

  const totalTime = getTotalPracticeTime();
  const averageAccuracy = getAverageAccuracy();
  const completedCount = getCompletedCount();
  const weeklyStats = getStatsForLastNDays(7);
  const monthlyStats = getStatsForLastNDays(30);
  const mostWrongWords = getMostWrongWords(10);

  const chartData = useMemo(() => {
    return weeklyStats.map(stat => ({
      name: new Date(stat.date).toLocaleDateString('zh-CN', { weekday: 'short' }),
      练习时长: Math.round(stat.practiceDuration / 60),
      正确率: stat.dictationAccuracy,
    }));
  }, [weeklyStats]);

  const monthlyChartData = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = i * 7;
      const weekEnd = weekStart + 7;
      const weekData = monthlyStats.slice(weekStart, weekEnd);
      const totalDuration = weekData.reduce((sum, d) => sum + d.practiceDuration, 0);
      const accuracies = weekData.filter(d => d.dictationAccuracy > 0);
      const avgAccuracy = accuracies.length > 0
        ? Math.round(accuracies.reduce((sum, d) => sum + d.dictationAccuracy, 0) / accuracies.length)
        : 0;
      weeks.push({
        name: `第${i + 1}周`,
        练习时长: Math.round(totalDuration / 60),
        正确率: avgAccuracy,
      });
    }
    return weeks;
  }, [monthlyStats]);

  const materialTypeStats = useMemo(() => {
    const counts: Record<string, number> = {
      news: 0,
      ted: 0,
      movie: 0,
      song: 0,
      podcast: 0,
    };
    
    materials.forEach(m => {
      counts[m.type]++;
    });

    return Object.entries(counts).map(([type, count]) => ({
      name: MaterialTypeLabels[type as keyof typeof MaterialTypeLabels],
      value: count,
      type,
    })).filter(d => d.value > 0);
  }, [materials]);

  const COLORS = ['#1E3A5F', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

  const accuracyLevels = [
    { min: 0, max: 59, label: '需要加强', color: 'text-red-600', bg: 'bg-red-50' },
    { min: 60, max: 79, label: '继续努力', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { min: 80, max: 100, label: '表现优秀', color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const accuracyLevel = accuracyLevels.find(l => averageAccuracy >= l.min && averageAccuracy <= l.max) || accuracyLevels[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">学习进度</h1>
        <p className="text-gray-500">追踪你的学习进度，了解薄弱环节</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">累计练习时长</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatTime(totalTime)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">平均正确率</p>
              <p className={`text-2xl font-bold mt-1 ${accuracyLevel.color}`}>{averageAccuracy}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className={`mt-3 px-3 py-1.5 rounded-full text-xs font-medium inline-block ${accuracyLevel.bg} ${accuracyLevel.color}`}>
            {accuracyLevel.label}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已完成材料</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {completedCount} / {materials.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              style={{ width: `${materials.length > 0 ? (completedCount / materials.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">易错词汇</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{wrongWords.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            练习记录: {practiceRecords.length} 次
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">本周练习趋势</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="练习时长" 
                  stroke="#1E3A5F" 
                  strokeWidth={2}
                  dot={{ fill: '#1E3A5F', strokeWidth: 2 }}
                  name="练习时长(分钟)"
                />
                <Line 
                  type="monotone" 
                  dataKey="正确率" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                  name="正确率(%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">材料类型分布</h3>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialTypeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#9CA3AF' }}
                >
                  {materialTypeStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">月度练习统计</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
                }} 
              />
              <Legend />
              <Bar dataKey="练习时长" fill="#1E3A5F" name="练习时长(分钟)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="正确率" fill="#F59E0B" name="正确率(%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">易错词汇 TOP 10</h3>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          
          {mostWrongWords.length > 0 ? (
            <div className="space-y-3">
              {mostWrongWords.map((word, index) => {
                const accuracy = word.practiceCount > 0 
                  ? Math.round((word.correctCount / word.practiceCount) * 100) 
                  : 0;
                
                return (
                  <div 
                    key={word.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{word.word}</span>
                        {word.correctWord && (
                          <span className="text-sm text-gray-500">→ {word.correctWord}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          错误 {word.practiceCount} 次
                        </span>
                        <span className="text-xs text-gray-500">
                          正确率 {accuracy}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p className="text-gray-500">太棒了！暂时没有易错词汇</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">学习建议</h3>
            <LightbulbIcon className="w-5 h-5 text-yellow-400" />
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">📊 根据数据分析</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {totalTime < 1800 && <li>• 建议每天练习至少30分钟，坚持是关键</li>}
                {averageAccuracy < 70 && <li>• 正确率有待提升，建议多做精听练习</li>}
                {wrongWords.length > 0 && <li>• 有 {wrongWords.length} 个易错词汇需要加强</li>}
                {completedCount === 0 && <li>• 还没有完成任何材料，从简单的开始吧！</li>}
                {totalTime >= 1800 && averageAccuracy >= 70 && <li>• 表现不错！继续保持，挑战更高难度</li>}
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-medium text-green-800 mb-2">🎯 今日目标</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">练习时长</span>
                  <span className="text-sm font-medium text-green-800">
                    {Math.round(totalTime % 1800 / 60)} / 30 分钟
                  </span>
                </div>
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(100, ((totalTime % 1800) / 1800) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">💡 学习技巧</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• 先精听再泛听，注意发音细节</li>
                <li>• 跟读模仿，注意语调和节奏</li>
                <li>• 记录易错词汇，定期复习</li>
                <li>• 坚持每天练习，效果才明显</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function LightbulbIcon(props: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
