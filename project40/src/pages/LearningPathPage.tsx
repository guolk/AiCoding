import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { LearningPath, WeakArea, LearningProgress, NextRecommendation, DifficultyLevel } from '@/types';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { getDifficultyLabel, getDifficultyColor } from '@/utils/music';
import { queryKeys } from '@/services/queryClient';
import { exercises } from '@/data/exercises';

const mockLearningPath: LearningPath = {
  id: 'learning-path-001',
  userId: 1,
  currentLevel: 'beginner',
  recommendedExercises: ['exercise-beginner-001', 'exercise-beginner-002', 'exercise-beginner-003'],
  weakAreas: [
    {
      id: 'weak-001',
      type: 'pitch',
      description: 'F音和G音的音准问题，特别是在换把位时',
      relatedExercises: ['exercise-beginner-001', 'exercise-beginner-002'],
      practiceCount: 8,
      improvementRate: 0.15,
    },
    {
      id: 'weak-002',
      type: 'rhythm',
      description: '八分音符的节奏稳定性需要加强',
      relatedExercises: ['exercise-beginner-003'],
      practiceCount: 5,
      improvementRate: 0.08,
    },
  ],
  progress: {
    totalExercisesCompleted: 12,
    exercisesByLevel: {
      beginner: 10,
      intermediate: 2,
      advanced: 0,
    },
    averageAccuracy: 78,
    totalPracticeMinutes: 480,
  },
  nextRecommended: {
    exerciseId: 'exercise-beginner-004',
    reason: '基于您当前的练习进度，建议继续练习音准和节奏',
    estimatedDifficulty: 'beginner',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-05-05T00:00:00Z',
};

const mockProgressData = [
  { week: '第1周', 准确率: 65, 练习时长: 60 },
  { week: '第2周', 准确率: 70, 练习时长: 90 },
  { week: '第3周', 准确率: 68, 练习时长: 75 },
  { week: '第4周', 准确率: 75, 练习时长: 120 },
  { week: '第5周', 准确率: 78, 练习时长: 135 },
];

function LearningPathPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'weakAreas' | 'recommendations'>('overview');

  const { data: learningPath, isLoading } = useQuery({
    queryKey: queryKeys.learningPath.detail(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockLearningPath;
    },
  });

  if (isLoading || !learningPath) {
    return (
      <Layout>
        <Loading isLoading={true} text="加载学习路径..." />
      </Layout>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: '学习概览', icon: '📊' },
    { key: 'weakAreas' as const, label: '弱项分析', icon: '🎯' },
    { key: 'recommendations' as const, label: '推荐内容', icon: '💡' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个性化学习路径</h1>
          <p className="text-gray-500 mt-1">基于您的练习数据，智能推荐学习内容</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="当前水平"
            value={getDifficultyLabel(learningPath.currentLevel)}
            color={getDifficultyColor(learningPath.currentLevel)}
          />
          <StatCard
            title="已完成练习"
            value={`${learningPath.progress.totalExercisesCompleted} 首`}
            color="blue"
          />
          <StatCard
            title="平均准确率"
            value={`${learningPath.progress.averageAccuracy}%`}
            color="green"
          />
          <StatCard
            title="总练习时长"
            value={`${Math.round(learningPath.progress.totalPracticeMinutes / 60)} 小时`}
            color="purple"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewView progress={learningPath.progress} />
            )}
            {activeTab === 'weakAreas' && (
              <WeakAreasView weakAreas={learningPath.weakAreas} />
            )}
            {activeTab === 'recommendations' && (
              <RecommendationsView
                nextRecommended={learningPath.nextRecommended}
                recommendedExercises={learningPath.recommendedExercises}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function OverviewView({ progress }: { progress: LearningProgress }) {
  const levelData = [
    { name: '基础', 数量: progress.exercisesByLevel.beginner, fill: '#10B981' },
    { name: '进阶', 数量: progress.exercisesByLevel.intermediate, fill: '#3B82F6' },
    { name: '高级', 数量: progress.exercisesByLevel.advanced, fill: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">准确率趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="准确率"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">各等级完成情况</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="数量" radius={[4, 4, 0, 0]}>
                  {levelData.map((entry, index) => (
                    <Bar key={index} dataKey="数量" fill={entry.fill} radius={[4, 4, 0, 0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">学习进度评估</h3>
            <p className="text-blue-100 mt-2">
              您的练习数据显示整体呈上升趋势，继续保持！
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{progress.averageAccuracy}%</div>
            <div className="text-blue-100">综合评分</div>
          </div>
        </div>
        <div className="mt-4 w-full bg-white bg-opacity-20 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-white"
            style={{ width: `${progress.averageAccuracy}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-blue-100">
          <span>入门</span>
          <span>进阶</span>
          <span>精通</span>
        </div>
      </div>
    </div>
  );
}

function WeakAreasView({ weakAreas }: { weakAreas: WeakArea[] }) {
  type WeakAreaType = 'pitch' | 'rhythm' | 'technique';
  type WeakAreaColor = 'blue' | 'green' | 'purple';

  const typeLabels: Record<WeakAreaType, string> = {
    pitch: '音准问题',
    rhythm: '节奏问题',
    technique: '技巧问题',
  };

  const typeColors: Record<WeakAreaType, WeakAreaColor> = {
    pitch: 'blue',
    rhythm: 'green',
    technique: 'purple',
  };

  const colorClasses: Record<WeakAreaColor, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  const textColorClasses: Record<WeakAreaColor, string> = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };

  const bgColorClasses: Record<WeakAreaColor, string> = {
    blue: 'bg-blue-200',
    green: 'bg-green-200',
    purple: 'bg-purple-200',
  };

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-medium text-yellow-800">智能分析提示</h4>
            <p className="text-sm text-yellow-700 mt-1">
              基于您最近 {weakAreas.length} 个练习会话的数据分析，系统识别出以下需要加强的领域。
              建议针对性地练习这些内容，提升整体演奏水平。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {weakAreas.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <span className="text-4xl">🎉</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">太棒了！</h3>
            <p className="mt-2 text-gray-500">您没有明显的弱项，继续保持练习！</p>
          </div>
        ) : (
          weakAreas.map((weakArea) => {
            const type = weakArea.type as WeakAreaType;
            const color = typeColors[type];

            return (
              <div
                key={weakArea.id}
                className={`rounded-xl border-2 p-6 ${colorClasses[color]}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${bgColorClasses[color]} ${textColorClasses[color]}`}>
                    {typeLabels[type]}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">练习次数</p>
                    <p className="text-xl font-bold text-gray-900">{weakArea.practiceCount}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{weakArea.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">提升进度</span>
                    <span className={`text-sm font-medium ${textColorClasses[color]}`}>
                      {Math.round(weakArea.improvementRate * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${bgColorClasses[color]}`}
                      style={{ width: `${weakArea.improvementRate * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">相关练习曲:</p>
                  <div className="flex flex-wrap gap-2">
                    {weakArea.relatedExercises.map((exerciseId) => {
                      const exercise = exercises.find(e => e.id === exerciseId);
                      return (
                        <span
                          key={exerciseId}
                          className="px-2 py-1 bg-white bg-opacity-70 rounded text-sm text-gray-700"
                        >
                          {exercise?.title || exerciseId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <Button className="w-full mt-4">
                  🎯 开始针对性练习
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RecommendationsView({
  nextRecommended,
  recommendedExercises,
}: {
  nextRecommended: NextRecommendation;
  recommendedExercises: string[];
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⭐</span>
          <div>
            <h3 className="text-xl font-bold">今日推荐练习</h3>
            <p className="text-green-100 text-sm">
              基于您的学习进度，系统智能推荐
            </p>
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <h4 className="font-semibold text-lg">
            {exercises.find(e => e.id === nextRecommended.exerciseId)?.title || '推荐练习曲'}
          </h4>
          <p className="text-green-100 mt-2">{nextRecommended.reason}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm">
              {getDifficultyLabel(nextRecommended.estimatedDifficulty)}
            </span>
            <Button className="bg-white text-green-600 hover:bg-green-50">
              🎵 开始练习
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">更多推荐练习</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedExercises.map((exerciseId) => {
            const exercise = exercises.find(e => e.id === exerciseId);
            if (!exercise) return null;

            const color = getDifficultyColor(exercise.difficulty);
            const colorClasses = {
              green: 'bg-green-50 border-green-200',
              blue: 'bg-blue-50 border-blue-200',
              red: 'bg-red-50 border-red-200',
              gray: 'bg-gray-50 border-gray-200',
            };

            return (
              <div
                key={exerciseId}
                className={`rounded-xl border-2 p-5 hover:shadow-lg transition-shadow cursor-pointer ${colorClasses[color]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">{exercise.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    color === 'green' ? 'bg-green-200 text-green-800' :
                    color === 'blue' ? 'bg-blue-200 text-blue-800' :
                    color === 'red' ? 'bg-red-200 text-red-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{exercise.description}</p>
                <Button variant="secondary" className="w-full" size="sm">
                  查看详情
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">学习路径建议</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 font-medium">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900">先攻克弱项</h4>
              <p className="text-sm text-gray-600">
                建议先完成针对弱项的练习，巩固基础后再学习新内容。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 font-medium">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900">保持练习频率</h4>
              <p className="text-sm text-gray-600">
                建议每天练习30-60分钟，持续练习比偶尔长时间练习效果更好。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 font-medium">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900">循序渐进</h4>
              <p className="text-sm text-gray-600">
                当基础练习准确率达到90%以上时，可以开始尝试进阶内容。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningPathPage;
