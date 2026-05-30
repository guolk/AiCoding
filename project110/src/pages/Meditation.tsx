import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  Wind, 
  Heart, 
  Star, 
  Play, 
  Pause, 
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useMeditationStore } from '@/stores/meditationStore';
import { usePracticeStore } from '@/stores/practiceStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Tag } from '@/components/ui/Tags';
import { BreathingCycle } from '@/types';
import { useTimer } from '@/hooks/useTimer';
import { useBreathing } from '@/hooks/useBreathing';
import { 
  BreathingTechnique, 
  MeditationScript, 
  MeditationCategory,
  WellnessRatings,
  AssessmentType
} from '@/types';
import { formatDuration, getMeditationCategoryLabel } from '@/utils';

export const Meditation: React.FC = () => {
  const location = useLocation();
  const { loadData, breathingTechniques, meditationScripts, getFavoriteScripts } = useMeditationStore();
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeTab = location.pathname.includes('/meditation/breathing') 
    ? 'breathing' 
    : location.pathname.includes('/meditation/meditate')
    ? 'meditate'
    : location.pathname.includes('/assessment')
    ? 'assessment'
    : 'overview';

  const favorites = getFavoriteScripts();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold text-sage-800 mb-2">
            冥想与呼吸
          </h1>
          <p className="text-sage-600">平静心灵，连接内在</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link
            to="/meditation"
            className={`flex-1 text-center py-3 rounded-xl font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            概览
          </Link>
          <Link
            to="/meditation/breathing"
            className={`flex-1 text-center py-3 rounded-xl font-medium transition-all ${
              activeTab === 'breathing'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            呼吸法
          </Link>
          <Link
            to="/meditation/meditate"
            className={`flex-1 text-center py-3 rounded-xl font-medium transition-all ${
              activeTab === 'meditate'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            冥想
          </Link>
          <Link
            to="/assessment"
            className={`flex-1 text-center py-3 rounded-xl font-medium transition-all ${
              activeTab === 'assessment'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            状态评估
          </Link>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Access */}
            <div className="grid grid-cols-2 gap-4">
              <Link to="/meditation/breathing">
                <Card className="text-center hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white">
                    <Wind size={32} />
                  </div>
                  <h3 className="font-semibold text-sage-800">呼吸法练习</h3>
                  <p className="text-sm text-sage-500 mt-1">{breathingTechniques.length} 种呼吸法</p>
                </Card>
              </Link>
              
              <Link to="/meditation/meditate">
                <Card className="text-center hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
                    <Heart size={32} />
                  </div>
                  <h3 className="font-semibold text-sage-800">冥想引导</h3>
                  <p className="text-sm text-sage-500 mt-1">{meditationScripts.length} 个脚本</p>
                </Card>
              </Link>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold text-sage-800 mb-3 flex items-center gap-2">
                  <Star size={20} className="text-yellow-500" fill="currentColor" />
                  收藏
                </h3>
                <div className="space-y-3">
                  {favorites.slice(0, 3).map((script) => (
                    <Link key={script.id} to={`/meditation/meditate/${script.id}`}>
                      <Card className="flex items-center justify-between hover:scale-[1.01] transition-transform cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Heart size={20} className="text-purple-500" />
                          </div>
                          <div>
                            <div className="font-medium text-sage-800">{script.title}</div>
                            <div className="text-xs text-sage-500">{formatDuration(script.defaultDuration)}</div>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-sage-400" />
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Assessment */}
            <Link to="/assessment">
              <Card className="bg-gradient-to-r from-sage-500 to-olive-500 text-white hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-1">今日状态评估</h3>
                    <p className="text-white/80 text-sm">记录你的身心状态</p>
                  </div>
                  <ChevronRight size={24} />
                </div>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export const BreathingExercise: React.FC = () => {
  const { loadData, breathingTechniques } = useMeditationStore();
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(300);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const breathingCycles: Record<string, BreathingCycle> = {
    'diaphragmatic-breathing': {
      phases: [
        { name: 'inhale' as const, duration: 4 },
        { name: 'hold' as const, duration: 2 },
        { name: 'exhale' as const, duration: 6 },
        { name: 'rest' as const, duration: 2 },
      ]
    },
    'ujjayi-breathing': {
      phases: [
        { name: 'inhale' as const, duration: 4 },
        { name: 'hold' as const, duration: 4 },
        { name: 'exhale' as const, duration: 6 },
        { name: 'rest' as const, duration: 2 },
      ]
    },
    'bhramari-breathing': {
      phases: [
        { name: 'inhale' as const, duration: 4 },
        { name: 'exhale' as const, duration: 8 },
        { name: 'rest' as const, duration: 2 },
      ]
    },
    'alternate-nostril-breathing': {
      phases: [
        { name: 'inhale' as const, duration: 4 },
        { name: 'hold' as const, duration: 4 },
        { name: 'exhale' as const, duration: 6 },
        { name: 'rest' as const, duration: 2 },
      ]
    },
    'kapalabhati': {
      phases: [
        { name: 'inhale' as const, duration: 1 },
        { name: 'exhale' as const, duration: 1 },
      ]
    },
  };

  if (selectedTechnique) {
    return (
      <BreathingPlayer
        technique={selectedTechnique}
        cycle={breathingCycles[selectedTechnique.id] || breathingCycles['diaphragmatic-breathing']}
        onBack={() => setSelectedTechnique(null)}
        duration={selectedDuration}
        setDuration={setSelectedDuration}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6"
        >
          <ArrowLeft size={20} />
          返回
        </button>

        <h2 className="font-display text-2xl font-semibold text-sage-800 mb-6">
          呼吸法
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {breathingTechniques.map((technique) => (
            <Card
              key={technique.id}
              className="hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => setSelectedTechnique(technique)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white shrink-0">
                  <Wind size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sage-800 mb-1">{technique.name}</h3>
                  <p className="text-xs text-sage-500 italic mb-2">{technique.sanskritName}</p>
                  <p className="text-sm text-sage-600 line-clamp-2">{technique.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

interface BreathingPlayerProps {
  technique: BreathingTechnique;
  cycle: BreathingCycle;
  onBack: () => void;
  duration: number;
  setDuration: (d: number) => void;
}

const BreathingPlayer: React.FC<BreathingPlayerProps> = ({ 
  technique, 
  cycle, 
  onBack,
  duration,
  setDuration
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const breathing = useBreathing({
    cycle,
    onCycleComplete: () => {
      setElapsedTime(prev => {
        const newTime = prev + cycle.phases.reduce((sum, p) => sum + p.duration, 0);
        if (newTime >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return newTime;
      });
    }
  });

  const totalSeconds = duration;
  const progress = totalSeconds > 0 ? (elapsedTime / totalSeconds) * 100 : 0;

  const phaseColors = {
    inhale: '#60A5FA',
    hold: '#A78BFA',
    exhale: '#34D399',
    rest: '#FBBF24',
  };

  const phaseLabels = {
    inhale: '吸气',
    hold: '屏息',
    exhale: '呼气',
    rest: '休息',
  };

  useEffect(() => {
    if (isPlaying && !breathing.isRunning) {
      breathing.start();
    } else if (!isPlaying && breathing.isRunning) {
      breathing.pause();
    }
  }, [isPlaying, breathing]);

  const handleReset = () => {
    setIsPlaying(false);
    breathing.reset();
    setElapsedTime(0);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-sage-50 to-blue-50">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6"
        >
          <ArrowLeft size={20} />
          返回
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-sage-800 mb-2">
            {technique.name}
          </h1>
          <p className="text-sage-500 italic">{technique.sanskritName}</p>
        </div>

        {/* Duration Selector */}
        {!isPlaying && (
          <Card className="mb-6">
            <label className="block text-sm font-medium text-sage-700 mb-3">
              练习时长
            </label>
            <div className="flex gap-2">
              {[180, 300, 600, 900].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    duration === d
                      ? 'bg-sage-500 text-white'
                      : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                  }`}
                >
                  {formatDuration(d)}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Breathing Visual */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <ProgressCircle
              progress={breathing.phaseProgress * 100}
              size={240}
              strokeWidth={8}
              color={phaseColors[breathing.currentPhase.name]}
              trackColor="#E8EFE8"
            >
              <div className="text-center">
                <div className={`text-4xl font-display font-semibold mb-2 text-sage-800 ${isPlaying ? 'animate-breathe' : ''}`}>
                  {phaseLabels[breathing.currentPhase.name]}
                </div>
                <div className="text-sage-500">
                  {breathing.currentPhase.duration - Math.floor(breathing.phaseProgress * breathing.currentPhase.duration)}s
                </div>
              </div>
            </ProgressCircle>
          </div>
          
          <div className="mt-6">
            <TimerDisplay seconds={Math.max(0, totalSeconds - elapsedTime)} isRunning={isPlaying} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button variant="secondary" onClick={handleReset} className="p-4">
            <RotateCcw size={24} />
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </Button>
        </div>

        {/* Instructions */}
        <Card>
          <h3 className="font-semibold text-sage-800 mb-3">练习步骤</h3>
          <ol className="space-y-2">
            {technique.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-sage-600">
                <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-600 text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
};

export const Meditate: React.FC = () => {
  const { loadData, meditationScripts, getScriptsByCategory, toggleFavorite, addCustomScript } = useMeditationStore();
  const [activeCategory, setActiveCategory] = useState<MeditationCategory | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newScript, setNewScript] = useState({
    title: '',
    content: '',
    defaultDuration: 300,
    category: 'mindfulness' as MeditationCategory,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredScripts = activeCategory === 'all' 
    ? meditationScripts 
    : getScriptsByCategory(activeCategory);

  const handleAddScript = () => {
    if (newScript.title.trim() && newScript.content.trim()) {
      addCustomScript({
        ...newScript,
        isFavorite: false,
      });
      setNewScript({
        title: '',
        content: '',
        defaultDuration: 300,
        category: 'mindfulness',
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6"
        >
          <ArrowLeft size={20} />
          返回
        </button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-sage-800">
            冥想引导
          </h2>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus size={18} />
            添加脚本
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-thin pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-sage-500 text-white'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            全部
          </button>
          {(['breath-awareness', 'body-scan', 'loving-kindness', 'mindfulness'] as MeditationCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-sage-500 text-white'
                  : 'bg-white text-sage-600 hover:bg-sage-50'
              }`}
            >
              {getMeditationCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Scripts List */}
        <div className="space-y-3">
          {filteredScripts.map((script) => (
            <MeditationScriptCard
              key={script.id}
              script={script}
              onToggleFavorite={() => toggleFavorite(script.id)}
            />
          ))}
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="font-display text-xl font-semibold text-sage-800 mb-6">
                添加冥想脚本
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={newScript.title}
                    onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
                    placeholder="例如：我的冥想脚本"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">类别</label>
                  <div className="flex flex-wrap gap-2">
                    {(['breath-awareness', 'body-scan', 'loving-kindness', 'mindfulness'] as MeditationCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewScript({ ...newScript, category: cat })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          newScript.category === cat
                            ? 'bg-sage-500 text-white'
                            : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                        }`}
                      >
                        {getMeditationCategoryLabel(cat)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">预计时长</label>
                  <div className="flex gap-2">
                    {[180, 300, 480, 600].map((d) => (
                      <button
                        key={d}
                        onClick={() => setNewScript({ ...newScript, defaultDuration: d })}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          newScript.defaultDuration === d
                            ? 'bg-sage-500 text-white'
                            : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                        }`}
                      >
                        {formatDuration(d)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">脚本内容</label>
                  <textarea
                    value={newScript.content}
                    onChange={(e) => setNewScript({ ...newScript, content: e.target.value })}
                    placeholder="输入你的冥想引导内容..."
                    rows={8}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowAddForm(false)} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleAddScript} className="flex-1">
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MeditationScriptCardProps {
  script: MeditationScript;
  onToggleFavorite: () => void;
}

const MeditationScriptCard: React.FC<MeditationScriptCardProps> = ({ script, onToggleFavorite }) => {
  const { deleteCustomScript } = useMeditationStore();

  const handleDelete = () => {
    if (!script.isBuiltIn && confirm('确定要删除这个脚本吗？')) {
      deleteCustomScript(script.id);
    }
  };

  return (
    <Card className="hover:scale-[1.01] transition-transform">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white shrink-0">
          <Heart size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-sage-800 mb-1">{script.title}</h3>
              <div className="flex items-center gap-2 text-xs text-sage-500">
                <span>{formatDuration(script.defaultDuration)}</span>
                <span>·</span>
                <span>{getMeditationCategoryLabel(script.category)}</span>
                {script.isBuiltIn && (
                  <>
                    <span>·</span>
                    <span className="text-sage-400">内置</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="p-2 hover:bg-sage-50 rounded-lg transition-colors"
              >
                <Star
                  size={18}
                  className={script.isFavorite ? 'text-yellow-500' : 'text-sage-300'}
                  fill={script.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
              {!script.isBuiltIn && (
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-sage-600 line-clamp-2 mt-2">{script.content}</p>
        </div>
      </div>
      
      <Link to={`/meditation/meditate/${script.id}`} className="mt-4 block">
        <Button variant="primary" size="full">
          <Play size={16} />
          开始冥想
        </Button>
      </Link>
    </Card>
  );
};

export const MeditatePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loadData, meditationScripts } = useMeditationStore();
  const { addAssessment } = usePracticeStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [ratings, setRatings] = useState<WellnessRatings>({
    physical: 5,
    mental: 5,
    emotional: 5,
    overall: 5,
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const script = meditationScripts.find(s => s.id === id);

  const {
    seconds,
    start,
    pause,
    reset,
  } = useTimer({
    initialSeconds: script?.defaultDuration || 300,
    countUp: false,
    onComplete: () => {
      setIsPlaying(false);
      setShowComplete(true);
    },
  });

  const handleComplete = () => {
    addAssessment('post-practice', ratings, notes);
    window.history.back();
  };

  if (!script) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-sage-500">脚本不存在</p>
        </Card>
      </div>
    );
  }

  const progress = ((script.defaultDuration - seconds) / script.defaultDuration) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6"
        >
          <ArrowLeft size={20} />
          返回
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-sage-800 mb-2">
            {script.title}
          </h1>
          <p className="text-sage-500">{getMeditationCategoryLabel(script.category)}</p>
        </div>

        {/* Progress */}
        <div className="h-2 bg-purple-100 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer */}
        <div className="text-center mb-8">
          <TimerDisplay seconds={seconds} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="secondary"
            onClick={() => {
              setIsPlaying(false);
              reset(script.defaultDuration);
            }}
            className="p-4"
          >
            <RotateCcw size={24} />
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (!isPlaying) start();
              else pause();
              setIsPlaying(!isPlaying);
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </Button>
        </div>

        {/* Script Content */}
        <Card className="max-h-64 overflow-y-auto scrollbar-thin">
          <p className="text-sage-700 leading-relaxed whitespace-pre-line">
            {script.content}
          </p>
        </Card>
      </div>

      {/* Complete Modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🧘</div>
              <h2 className="font-display text-2xl font-semibold text-sage-800 mb-2">
                冥想完成！
              </h2>
              <p className="text-sage-500">感觉如何？</p>
            </div>

            <div className="space-y-4 mb-6">
              {(['physical', 'mental', 'emotional', 'overall'] as const).map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-sage-700">
                      {key === 'physical' ? '身体状态' :
                       key === 'mental' ? '心理状态' :
                       key === 'emotional' ? '情绪状态' : '整体感受'}
                    </label>
                    <span className="text-sage-600 font-medium">{ratings[key]}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={ratings[key]}
                    onChange={(e) => setRatings(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">备注（可选）</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录这次冥想的感受..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <Button onClick={handleComplete} size="full" className="bg-gradient-to-r from-purple-500 to-pink-500">
              保存并完成
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AssessmentPage: React.FC = () => {
  const { loadData, assessments, addAssessment, getAssessmentTrend } = usePracticeStore();
  
  const [showForm, setShowForm] = useState(false);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('daily');
  const [ratings, setRatings] = useState<WellnessRatings>({
    physical: 5,
    mental: 5,
    emotional: 5,
    overall: 5,
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const trend = getAssessmentTrend();

  const handleSubmit = () => {
    addAssessment(assessmentType, ratings, notes);
    setShowForm(false);
    setRatings({ physical: 5, mental: 5, emotional: 5, overall: 5 });
    setNotes('');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6"
        >
          <ArrowLeft size={20} />
          返回
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-sage-800 mb-2">
              状态评估
            </h1>
            <p className="text-sage-600">记录你的身心状态变化</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} />
            新建评估
          </Button>
        </div>

        {/* Latest Assessment */}
        {trend.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-semibold text-sage-800 mb-4">最近评估</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['physical', 'mental', 'emotional', 'overall'] as const).map((key) => (
                <div key={key} className="text-center">
                  <ProgressCircle
                    progress={trend[0].ratings[key] * 10}
                    size={80}
                    strokeWidth={6}
                    color={
                      trend[0].ratings[key] >= 8 ? '#22c55e' :
                      trend[0].ratings[key] >= 6 ? '#84cc16' :
                      trend[0].ratings[key] >= 4 ? '#eab308' : '#ef4444'
                    }
                  >
                    <span className="text-lg font-semibold text-sage-700">
                      {trend[0].ratings[key]}
                    </span>
                  </ProgressCircle>
                  <div className="text-sm text-sage-600 mt-2">
                    {key === 'physical' ? '身体' :
                     key === 'mental' ? '心理' :
                     key === 'emotional' ? '情绪' : '整体'}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-sm text-sage-500">
              {trend[0].type === 'post-practice' ? '练习后评估' : '日常评估'} · {trend[0].date}
            </div>
          </Card>
        )}

        {/* History */}
        {trend.length > 1 && (
          <div>
            <h3 className="font-semibold text-sage-800 mb-3">历史记录</h3>
            <div className="space-y-3">
              {trend.slice(1).map((assessment) => (
                <Card key={assessment.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-sage-500">{assessment.date}</span>
                      <Tag color={assessment.type === 'post-practice' ? 'sage' : 'cream'}>
                        {assessment.type === 'post-practice' ? '练习后' : '日常'}
                      </Tag>
                    </div>
                    <div className="flex gap-2 text-sm">
                      {(['physical', 'mental', 'emotional', 'overall'] as const).map((key) => (
                        <div key={key} className="text-center">
                          <div className="font-semibold text-sage-700">{assessment.ratings[key]}</div>
                          <div className="text-xs text-sage-400">
                            {key === 'physical' ? '身' :
                             key === 'mental' ? '心' :
                             key === 'emotional' ? '情' : '整'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {assessment.notes && (
                    <p className="text-sm text-sage-600 pt-2 border-t border-cream-100">
                      {assessment.notes}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {trend.length === 0 && (
          <Card className="text-center py-12">
            <Heart size={48} className="mx-auto text-sage-300 mb-4" />
            <p className="text-sage-500 mb-4">还没有状态评估记录</p>
            <Button onClick={() => setShowForm(true)}>
              开始第一次评估
            </Button>
          </Card>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="font-display text-xl font-semibold text-sage-800 mb-6">
                状态评估
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-2">评估类型</label>
                  <div className="flex gap-2">
                    {(['daily', 'post-practice'] as AssessmentType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAssessmentType(type)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          assessmentType === type
                            ? 'bg-sage-500 text-white'
                            : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                        }`}
                      >
                        {type === 'daily' ? '日常评估' : '练习后评估'}
                      </button>
                    ))}
                  </div>
                </div>

                {(['physical', 'mental', 'emotional', 'overall'] as const).map((key) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-sage-700">
                        {key === 'physical' ? '身体状态' :
                         key === 'mental' ? '心理状态' :
                         key === 'emotional' ? '情绪状态' : '整体感受'}
                      </label>
                      <span className="text-sage-600 font-medium">{ratings[key]}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={ratings[key]}
                      onChange={(e) => setRatings(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-sage-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">备注（可选）</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="记录今天的身心感受..."
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditation;
