import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Exercise, DifficultyLevel } from '@/types';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Input from '@/components/Input';
import { getExercisesByDifficulty, searchExercises, exercises } from '@/data/exercises';
import { getDifficultyLabel, getDifficultyColor } from '@/utils/music';
import { queryKeys } from '@/services/queryClient';

function ExercisesPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const { data: exercisesData, isLoading } = useQuery({
    queryKey: queryKeys.exercises.list(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { items: exercises, total: exercises.length };
    },
  });

  const filteredExercises = (exercisesData?.items || []).filter(exercise => {
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    const matchesSearch = searchQuery === '' || 
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesSearch;
  });

  const beginnerCount = getExercisesByDifficulty('beginner').length;
  const intermediateCount = getExercisesByDifficulty('intermediate').length;
  const advancedCount = getExercisesByDifficulty('advanced').length;

  if (isLoading) {
    return (
      <Layout>
        <Loading isLoading={true} text="加载练习曲库..." />
      </Layout>
    );
  }

  if (selectedExercise) {
    return (
      <Layout>
        <ExerciseDetail
          exercise={selectedExercise}
          onBack={() => setSelectedExercise(null)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">练习曲库</h1>
          <p className="text-gray-500 mt-1">选择适合您水平的练习曲进行练习</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="基础练习曲"
            count={beginnerCount}
            color="green"
            active={difficultyFilter === 'beginner'}
            onClick={() => setDifficultyFilter(difficultyFilter === 'beginner' ? 'all' : 'beginner')}
          />
          <StatCard
            label="进阶练习曲"
            count={intermediateCount}
            color="blue"
            active={difficultyFilter === 'intermediate'}
            onClick={() => setDifficultyFilter(difficultyFilter === 'intermediate' ? 'all' : 'intermediate')}
          />
          <StatCard
            label="高级练习曲"
            count={advancedCount}
            color="red"
            active={difficultyFilter === 'advanced'}
            onClick={() => setDifficultyFilter(difficultyFilter === 'advanced' ? 'all' : 'advanced')}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="搜索练习曲名称、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel | 'all')}
              options={[
                { value: 'all', label: '全部难度' },
                { value: 'beginner', label: '基础' },
                { value: 'intermediate', label: '进阶' },
                { value: 'advanced', label: '高级' },
              ]}
              className="w-40"
            />
            {difficultyFilter !== 'all' && (
              <Button variant="secondary" onClick={() => setDifficultyFilter('all')}>
                清除筛选
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => setSelectedExercise(exercise)}
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">没有找到练习曲</h3>
            <p className="mt-2 text-gray-500">尝试调整搜索条件或筛选器</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatCard({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: 'green' | 'blue' | 'red';
  active: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    green: active
      ? 'bg-green-100 text-green-700 border-green-300'
      : 'bg-green-50 text-green-600 border-green-200',
    blue: active
      ? 'bg-blue-100 text-blue-700 border-blue-300'
      : 'bg-blue-50 text-blue-600 border-blue-200',
    red: active
      ? 'bg-red-100 text-red-700 border-red-300'
      : 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${colorClasses[color]}`}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{count}</p>
      <p className="text-xs mt-1 opacity-75">首练习曲</p>
    </button>
  );
}

function ExerciseCard({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) {
  const color = getDifficultyColor(exercise.difficulty);
  const label = getDifficultyLabel(exercise.difficulty);

  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {exercise.title}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
            {label}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {exercise.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {exercise.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {exercise.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
              +{exercise.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{exercise.duration} 秒</span>
          </div>
          <span className="text-sm text-blue-600 font-medium">开始练习 →</span>
        </div>
      </div>
    </div>
  );
}

function ExerciseDetail({ exercise, onBack }: { exercise: Exercise; onBack: () => void }) {
  const [showPractice, setShowPractice] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onBack}>
          ← 返回列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
          <p className="text-gray-500 mt-1">{exercise.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">乐谱预览</h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-64 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">乐谱编辑器预览区域</p>
                <p className="text-xs text-gray-400 mt-1">{exercise.sheetMusic.measures.length} 小节</p>
              </div>
            </div>
          </div>

          {showPractice ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">练习模式</h3>
                <Button variant="secondary" onClick={() => setShowPractice(false)}>
                  退出练习
                </Button>
              </div>
              <PracticeSession exercise={exercise} />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">准备好开始练习了吗？</h3>
              <p className="text-blue-100 mb-4">
                开启麦克风，系统将实时检测您的音准和节奏，并给出反馈。
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowPractice(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  🎵 开始练习
                </Button>
                <div className="text-sm text-blue-100">
                  <p>预计练习时长: {exercise.duration} 秒</p>
                  <p>难度: {getDifficultyLabel(exercise.difficulty)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">练习信息</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">难度</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  exercise.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getDifficultyLabel(exercise.difficulty)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">时长</span>
                <span className="font-medium">{exercise.duration} 秒</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">小节数</span>
                <span className="font-medium">{exercise.sheetMusic.measures.length} 小节</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">调号</span>
                <span className="font-medium">{exercise.sheetMusic.keySignature}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">速度</span>
                <span className="font-medium">{exercise.sheetMusic.tempo} BPM</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">标签</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">练习提示</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>先慢练，确保每个音的准确性</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>使用节拍器保持稳定的节奏</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>注意指法标记，保持良好的手型</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeSession({ exercise }: { exercise: Exercise }) {
  const [isListening, setIsListening] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<{ note: string; octave: number; deviation: number } | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setElapsedTime(0);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className={`relative w-40 h-40 rounded-full flex items-center justify-center ${
          isListening ? 'bg-gradient-to-br from-green-400 to-blue-500 animate-pulse' : 'bg-gray-100'
        }`}>
          <div className={`w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-inner`}>
            {isListening ? (
              <div className="text-center">
                {currentPitch ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900">
                      {currentPitch.note}<sub className="text-sm">{currentPitch.octave}</sub>
                    </p>
                    <p className={`text-sm ${
                      Math.abs(currentPitch.deviation) < 0.1 ? 'text-green-500' : 'text-orange-500'
                    }`}>
                      {Math.abs(currentPitch.deviation) < 0.1 ? '✓ 音准' : '← 调整音高'}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400">聆听中...</p>
                )}
              </div>
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">准确率</p>
          <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">已练习</p>
          <p className="text-2xl font-bold text-blue-600">{elapsedTime}s</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">状态</p>
          <p className={`text-2xl font-bold ${isListening ? 'text-green-600' : 'text-gray-400'}`}>
            {isListening ? '练习中' : '待机'}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={toggleListening}
          className={isListening ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          {isListening ? '⏹ 停止练习' : '🎤 开始录音'}
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>提示：</strong>请确保已授权麦克风权限已开启。系统将实时分析您演奏的音高，并与标准乐谱进行对比。
        </p>
      </div>
    </div>
  );
}

export default ExercisesPage;
