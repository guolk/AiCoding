import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shuffle, BookOpen, Target, Mic, TrendingUp, ChevronRight } from 'lucide-react';
import { StatsCard, ProgressChart } from '../components/StatsCard';
import { MaterialCard } from '../components/MaterialCard';
import { useMaterialStore, useProgressStore, usePracticeStore } from '../stores';
import { formatTime } from '../utils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { materials } = useMaterialStore();
  const { getTotalPracticeTime, getAverageAccuracy, getCompletedCount, getStatsForLastNDays } = useProgressStore();
  const { getMostWrongWords } = usePracticeStore();

  const totalTime = getTotalPracticeTime();
  const averageAccuracy = getAverageAccuracy();
  const completedCount = getCompletedCount();
  const weeklyStats = getStatsForLastNDays(7);
  const wrongWords = getMostWrongWords(5);
  const recentMaterials = materials.slice(0, 4);

  const weeklyChartData = weeklyStats.map(stat => ({
    name: new Date(stat.date).toLocaleDateString('zh-CN', { weekday: 'short' }),
    value: Math.round(stat.practiceDuration / 60),
  }));

  const quickActions = [
    { 
      icon: Play, 
      label: '继续上次练习', 
      description: '上次未完成的材料', 
      onClick: () => navigate('/materials'),
      color: 'from-[#1E3A5F] to-[#2d4f7a]'
    },
    { 
      icon: Shuffle, 
      label: '随机练习', 
      description: '系统随机推荐', 
      onClick: () => {
        const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
        if (randomMaterial) navigate(`/dictation/${randomMaterial.id}`);
      },
      color: 'from-[#F59E0B] to-[#fbbf24]'
    },
    { 
      icon: Target, 
      label: '薄弱词汇', 
      description: '强化易错词汇', 
      onClick: () => navigate('/progress'),
      color: 'from-green-500 to-green-600'
    },
    { 
      icon: Mic, 
      label: '跟读练习', 
      description: '提升口语发音', 
      onClick: () => navigate('/materials'),
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              欢迎回来！今天也要加油练习 💪
            </h1>
            <p className="text-white/80">
              坚持每天练习，听力水平稳步提升
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{completedCount}</p>
              <p className="text-sm text-white/70">已完成</p>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">{formatTime(totalTime)}</p>
              <p className="text-sm text-white/70">总时长</p>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">{averageAccuracy}%</p>
              <p className="text-sm text-white/70">正确率</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-left group hover:-translate-y-1"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{action.label}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          type="time" 
          value={formatTime(totalTime)} 
          label="累计练习时长" 
          subtitle="总练习时间"
          progress={Math.min(100, (totalTime / 3600) * 10)}
        />
        <StatsCard 
          type="accuracy" 
          value={`${averageAccuracy}%`} 
          label="平均正确率" 
          subtitle="听写练习"
          progress={averageAccuracy}
        />
        <StatsCard 
          type="completed" 
          value={completedCount} 
          label="已掌握材料" 
          subtitle={`共 ${materials.length} 个材料`}
          progress={(completedCount / materials.length) * 100 || 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart title="本周练习时长 (分钟)" data={weeklyChartData} />
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">易错词汇</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          {wrongWords.length > 0 ? (
            <div className="space-y-3">
              {wrongWords.map((word, index) => (
                <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{word.word}</p>
                      <p className="text-sm text-gray-500">正确: {word.correctWord}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{word.practiceCount}次</p>
                    <p className="text-xs text-gray-500">错误</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>还没有易错词汇，继续保持！</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">推荐材料</h2>
          <button 
            onClick={() => navigate('/materials')}
            className="flex items-center gap-1 text-[#1E3A5F] hover:underline"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentMaterials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onSelect={(id) => navigate(`/materials/${id}`)}
              onPlay={(id) => navigate(`/dictation/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
