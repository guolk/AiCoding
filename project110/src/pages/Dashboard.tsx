import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Flame, 
  Trophy, 
  TrendingUp,
  Calendar,
  Leaf,
  Dumbbell,
  Flower2,
  Moon,
  Sun,
  Cloud,
  BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePracticeStore } from '@/stores/practiceStore';
import { useSequenceStore } from '@/stores/sequenceStore';
import { usePoseStore } from '@/stores/poseStore';
import { formatDuration, getTargetGoalLabel } from '@/utils';
import { TargetGoal, TARGET_GOALS } from '@/types';

const goalIcons: Record<TargetGoal, React.ReactNode> = {
  'stress-relief': <Cloud size={24} />,
  'strength': <Dumbbell size={24} />,
  'flexibility': <Flower2 size={24} />,
  'relaxation': <Moon size={24} />,
  'energy': <Sun size={24} />,
};

export const Dashboard: React.FC = () => {
  const { getStatistics, getRecentRecords } = usePracticeStore();
  const { getBuiltIn, loadSequences } = useSequenceStore();
  const { poses } = usePoseStore();
  
  const stats = getStatistics();
  const builtInSequences = getBuiltIn();
  const recentRecords = getRecentRecords(3);

  useEffect(() => {
    loadSequences();
  }, [loadSequences]);

  const recommendedSequence = builtInSequences[0];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-sage-800 mb-2">
            早安，瑜伽行者 🌿
          </h1>
          <p className="text-sage-600">
            今天是开始练习的好日子
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame size={24} className="text-orange-500" />
            </div>
            <div className="text-2xl font-semibold text-sage-800">{stats.currentStreak}</div>
            <div className="text-sm text-sage-500">连续练习</div>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sage-100 flex items-center justify-center">
              <Trophy size={24} className="text-sage-500" />
            </div>
            <div className="text-2xl font-semibold text-sage-800">{stats.totalPractices}</div>
            <div className="text-sm text-sage-500">总练习次数</div>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <ClockIcon size={24} className="text-blue-500" />
            </div>
            <div className="text-2xl font-semibold text-sage-800">{stats.totalMinutes}</div>
            <div className="text-sm text-sage-500">总练习分钟</div>
          </Card>
          
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-olive-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-olive-500" />
            </div>
            <div className="text-2xl font-semibold text-sage-800">{poses.length}</div>
            <div className="text-sm text-sage-500">已学习体式</div>
          </Card>
        </div>

        {/* Recommended Sequence */}
        {recommendedSequence && (
          <Card className="mb-8 bg-gradient-to-r from-sage-500 to-olive-500 text-white overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Leaf size={20} />
                  <span className="text-sm opacity-90">今日推荐</span>
                </div>
                <h2 className="font-display text-2xl font-semibold mb-1">
                  {recommendedSequence.name}
                </h2>
                <p className="text-white/80 text-sm mb-3">
                  {recommendedSequence.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span>⏱ {formatDuration(recommendedSequence.totalDuration)}</span>
                  <span>🎯 {recommendedSequence.poses.length} 个体式</span>
                </div>
              </div>
              <Link to={`/sequences/${recommendedSequence.id}`}>
                <Button variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Play size={18} />
                  开始练习
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick Start */}
        <div className="mb-8">
          <h3 className="font-display text-xl font-semibold text-sage-800 mb-4">按目标练习</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TARGET_GOALS.map((goal) => {
              const sequences = useSequenceStore.getState().getByGoal(goal.value);
              const sequence = sequences[0];
              
              return (
                <Link
                  key={goal.value}
                  to={sequence ? `/sequences/${sequence.id}` : '/sequences'}
                >
                  <Card className="text-center hover:scale-105 transition-transform cursor-pointer">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-sage-100 flex items-center justify-center text-sage-500">
                      {goalIcons[goal.value]}
                    </div>
                    <div className="text-sm font-medium text-sage-800">
                      {getTargetGoalLabel(goal.value)}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Practice */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-semibold text-sage-800">最近练习</h3>
            <Link to="/practice" className="text-sm text-sage-500 hover:text-sage-700">
              查看全部 →
            </Link>
          </div>
          
          {recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <Card key={record.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
                      <Calendar size={20} className="text-sage-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sage-800">{record.sequenceName}</div>
                      <div className="text-sm text-sage-500">{record.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sage-700">{formatDuration(record.duration)}</div>
                    <div className="text-xs text-sage-500">能量: {record.energyLevel === 'high' ? '高' : record.energyLevel === 'medium' ? '中' : '低'}</div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-sage-300 mb-4" />
              <p className="text-sage-500 mb-4">还没有练习记录</p>
              <Link to="/sequences">
                <Button>开始第一次练习</Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Explore */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/poses">
            <Card className="group hover:scale-[1.02] transition-transform cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-sage-800 mb-1">
                    体式库
                  </h4>
                  <p className="text-sm text-sage-500">
                    探索 {poses.length} 种瑜伽体式
                  </p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link to="/sequences">
            <Card className="group hover:scale-[1.02] transition-transform cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center text-white">
                  <Calendar size={32} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-sage-800 mb-1">
                    课程规划
                  </h4>
                  <p className="text-sm text-sage-500">
                    标准序列或创建自定义课程
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ClockIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default Dashboard;
