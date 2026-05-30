import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, GripVertical, Clock, Play, Save, X } from 'lucide-react';
import { useSequenceStore } from '@/stores/sequenceStore';
import { usePoseStore } from '@/stores/poseStore';
import { usePracticeStore } from '@/stores/practiceStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SequenceCard } from '@/components/SequenceCard';
import { TimerDisplay } from '@/components/TimerDisplay';
import { useTimer } from '@/hooks/useTimer';
import { YogaPose, YogaSequence, PoseSequenceItem, TargetGoal, EnergyLevel, TARGET_GOALS } from '@/types';
import { formatDuration, formatTime, getTargetGoalLabel } from '@/utils';

export const Sequences: React.FC = () => {
  const navigate = useNavigate();
  const { loadSequences, getBuiltIn, getCustom, deleteSequence, startEditing } = useSequenceStore();
  const [activeTab, setActiveTab] = useState<'built-in' | 'custom' | 'goals'>('built-in');

  useEffect(() => {
    loadSequences();
  }, [loadSequences]);

  const builtInSequences = getBuiltIn();
  const customSequences = getCustom();

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个序列吗？')) {
      deleteSequence(id);
    }
  };

  const handleEdit = (sequence: YogaSequence) => {
    startEditing(sequence);
    navigate('/sequences/create');
  };

  const handleCreateNew = () => {
    startEditing();
    navigate('/sequences/create');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-sage-800 mb-2">
              课程规划
            </h1>
            <p className="text-sage-600">探索标准序列或创建你自己的课程</p>
          </div>
          <Button onClick={handleCreateNew} className="mt-4 md:mt-0">
            <Plus size={18} />
            创建自定义序列
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'built-in', label: '标准序列' },
            { key: 'custom', label: '我的序列' },
            { key: 'goals', label: '按目标选择' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-sage-500 text-white'
                  : 'bg-white text-sage-600 hover:bg-sage-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'built-in' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {builtInSequences.map((sequence) => (
              <SequenceCard key={sequence.id} sequence={sequence} />
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <>
            {customSequences.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customSequences.map((sequence) => (
                  <SequenceCard
                    key={sequence.id}
                    sequence={sequence}
                    showActions
                    onEdit={() => handleEdit(sequence)}
                    onDelete={() => handleDelete(sequence.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-sage-500 mb-4">还没有创建自定义序列</p>
                <Button onClick={() => navigate('/sequences/create')}>
                  <Plus size={18} />
                  创建第一个序列
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            {TARGET_GOALS.map((goal) => {
              const sequences = useSequenceStore.getState().getByGoal(goal.value);
              return (
                <div key={goal.value}>
                  <h3 className="font-display text-lg font-semibold text-sage-800 mb-3">
                    {getTargetGoalLabel(goal.value)}
                  </h3>
                  {sequences.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sequences.map((sequence) => (
                        <SequenceCard key={sequence.id} sequence={sequence} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <p className="text-sage-500 text-center py-4">暂无此类序列</p>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const SequenceEditor: React.FC = () => {
  const navigate = useNavigate();
  const { poses } = usePoseStore();
  const { 
    editingSequence, 
    startEditing, 
    updateEditingSequence,
    addPoseToEditing,
    removePoseFromEditing,
    reorderPosesInEditing,
    updatePoseDurationInEditing,
    saveEditingSequence,
  } = useSequenceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPoseSelector, setShowPoseSelector] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!editingSequence) {
      startEditing();
    }
  }, [editingSequence, startEditing]);

  if (!editingSequence) {
    return <div className="p-8">加载中...</div>;
  }

  const filteredPoses = poses.filter(
    (p) =>
      p.nameChinese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameSanskrit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPose = (pose: YogaPose) => {
    addPoseToEditing({
      poseId: pose.id,
      poseName: pose.nameChinese,
      duration: pose.defaultDuration,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderPosesInEditing(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (!editingSequence.name.trim()) {
      alert('请输入序列名称');
      return;
    }
    if (editingSequence.poses.length === 0) {
      alert('请至少添加一个体式');
      return;
    }
    saveEditingSequence();
    navigate('/sequences');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/sequences')}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-800"
          >
            <ArrowLeft size={20} />
            取消
          </button>
          <h1 className="font-display text-2xl font-semibold text-sage-800">
            {editingSequence.createdAt ? '编辑序列' : '创建序列'}
          </h1>
          <Button onClick={handleSave}>
            <Save size={18} />
            保存
          </Button>
        </div>

        {/* Basic Info */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                序列名称 *
              </label>
              <input
                type="text"
                value={editingSequence.name}
                onChange={(e) => updateEditingSequence({ name: e.target.value })}
                placeholder="例如：晨间活力序列"
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white/80 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                描述
              </label>
              <textarea
                value={editingSequence.description}
                onChange={(e) => updateEditingSequence({ description: e.target.value })}
                placeholder="描述这个序列的目标和适合的场景..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white/80 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                目标
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => updateEditingSequence({ targetGoal: goal.value as TargetGoal })}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      editingSequence.targetGoal === goal.value
                        ? 'bg-sage-500 text-white'
                        : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                    }`}
                  >
                    {getTargetGoalLabel(goal.value)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Pose List */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sage-800">体式序列</h3>
              <p className="text-sm text-sage-500">
                共 {editingSequence.poses.length} 个体式 · 总时长 {formatDuration(editingSequence.totalDuration)}
              </p>
            </div>
            <Button onClick={() => setShowPoseSelector(true)}>
              <Plus size={16} />
              添加体式
            </Button>
          </div>

          {editingSequence.poses.length > 0 ? (
            <div className="space-y-2">
              {editingSequence.poses.map((pose, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    draggedIndex === index
                      ? 'border-sage-400 bg-sage-50 opacity-50'
                      : 'border-cream-200 hover:border-sage-300 cursor-move'
                  }`}
                >
                  <GripVertical size={18} className="text-sage-300" />
                  <span className="w-6 h-6 rounded-full bg-sage-100 text-sage-600 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 font-medium text-sage-800">{pose.poseName}</span>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-sage-400" />
                    <input
                      type="number"
                      value={pose.duration}
                      onChange={(e) =>
                        updatePoseDurationInEditing(index, parseInt(e.target.value) || 30)
                      }
                      className="w-16 px-2 py-1 text-sm rounded-lg border border-cream-200 text-center"
                      min={5}
                      step={5}
                    />
                    <span className="text-sm text-sage-500">秒</span>
                  </div>
                  <button
                    onClick={() => removePoseFromEditing(index)}
                    className="p-1 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sage-500">
              <p>点击上方按钮添加体式到序列中</p>
            </div>
          )}
        </Card>

        {/* Pose Selector Modal */}
        {showPoseSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sage-800">选择体式</h3>
                <button
                  onClick={() => setShowPoseSelector(false)}
                  className="p-2 hover:bg-sage-50 rounded-lg"
                >
                  <X size={20} className="text-sage-500" />
                </button>
              </div>
              
              <div className="p-4 border-b">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索体式..."
                  className="w-full px-4 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              
              <div className="overflow-y-auto max-h-96 p-4 space-y-2">
                {filteredPoses.map((pose) => (
                  <button
                    key={pose.id}
                    onClick={() => {
                      handleAddPose(pose);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sage-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                      <span className="text-lg">🧘</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sage-800">{pose.nameChinese}</div>
                      <div className="text-xs text-sage-500">{pose.nameSanskrit}</div>
                    </div>
                    <div className="text-sm text-sage-500">
                      {formatDuration(pose.defaultDuration)}
                    </div>
                    <Plus size={18} className="text-sage-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SequencePlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadSequences, getById } = useSequenceStore();
  const { addRecord } = usePracticeStore();
  
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [bodyFeelings, setBodyFeelings] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSequences();
  }, [loadSequences]);

  const sequence = id ? getById(id) : undefined;
  
  const currentPose = sequence?.poses[currentPoseIndex];
  const totalDuration = sequence?.totalDuration || 0;

  const {
    seconds: poseSeconds,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    setSeconds,
  } = useTimer({
    initialSeconds: currentPose?.duration || 0,
    countUp: false,
    onComplete: () => {
      if (sequence && currentPoseIndex < sequence.poses.length - 1) {
        setCurrentPoseIndex((prev) => prev + 1);
        setSeconds(sequence.poses[currentPoseIndex + 1].duration);
      } else {
        setIsFinished(true);
        setShowCompleteModal(true);
      }
    },
  });

  const handleStart = () => {
    if (currentPose) {
      if (!isRunning && !isPaused) {
        setSeconds(currentPose.duration);
      }
      isPaused ? resume() : start();
    }
  };

  const handleNext = () => {
    if (sequence && currentPoseIndex < sequence.poses.length - 1) {
      setCurrentPoseIndex((prev) => prev + 1);
      reset(sequence.poses[currentPoseIndex + 1].duration);
    }
  };

  const handlePrev = () => {
    if (currentPoseIndex > 0 && sequence) {
      setCurrentPoseIndex((prev) => prev - 1);
      reset(sequence.poses[currentPoseIndex - 1].duration);
    }
  };

  const handleComplete = () => {
    if (!sequence) return;
    
    addRecord({
      date: new Date().toISOString().split('T')[0],
      duration: totalDuration,
      sequenceId: sequence.id,
      sequenceName: sequence.name,
      bodyFeelings,
      energyLevel,
      completedPoses: sequence.poses.map((p) => p.poseId),
      notes,
    });
    
    navigate('/practice');
  };

  if (!sequence) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-sage-500">序列不存在</p>
        </Card>
      </div>
    );
  }

  const progress = currentPose ? ((currentPoseIndex + 1) / sequence.poses.length) * 100 : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-sage-50 to-cream-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/sequences')}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-800"
          >
            <ArrowLeft size={20} />
            返回
          </button>
          <div className="text-center">
            <h1 className="font-display text-xl font-semibold text-sage-800">
              {sequence.name}
            </h1>
            <p className="text-sm text-sage-500">
              {currentPoseIndex + 1} / {sequence.poses.length}
            </p>
          </div>
          <div className="w-16" />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sage-400 to-sage-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Pose */}
        <Card className="text-center mb-8 py-12">
          <div className="text-8xl mb-6 animate-float">🧘</div>
          <h2 className="font-display text-3xl font-semibold text-sage-800 mb-2">
            {currentPose?.poseName || '准备开始'}
          </h2>
          <p className="text-sage-500 mb-8">
            {isFinished ? '练习完成！' : '保持呼吸，专注当下'}
          </p>

          {!isFinished && <TimerDisplay seconds={poseSeconds} isRunning={isRunning} />}
        </Card>

        {/* Controls */}
        {!isFinished && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={currentPoseIndex === 0}
              className="p-4"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              className="w-24 h-24 rounded-full"
            >
              {isRunning && !isPaused ? (
                <span className="text-2xl">⏸</span>
              ) : (
                <Play size={32} />
              )}
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={currentPoseIndex === sequence.poses.length - 1}
              className="p-4"
            >
              <ChevronRightIcon size={20} />
            </Button>
          </div>
        )}

        {/* Pose List */}
        <Card>
          <h3 className="font-semibold text-sage-800 mb-4">体式序列</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {sequence.poses.map((pose, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  index === currentPoseIndex
                    ? 'bg-sage-100 border-2 border-sage-300'
                    : index < currentPoseIndex
                    ? 'bg-olive-50 text-olive-600'
                    : 'bg-cream-50'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === currentPoseIndex
                      ? 'bg-sage-500 text-white'
                      : index < currentPoseIndex
                      ? 'bg-olive-400 text-white'
                      : 'bg-cream-200 text-sage-500'
                  }`}
                >
                  {index < currentPoseIndex ? '✓' : index + 1}
                </span>
                <span className="flex-1 font-medium">{pose.poseName}</span>
                <span className="text-sm text-sage-500">
                  {formatTime(pose.duration)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-display text-2xl font-semibold text-sage-800 mb-2">
                练习完成！
              </h2>
              <p className="text-sage-500">太棒了！你完成了 {formatDuration(totalDuration)} 的练习</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  身体感受
                </label>
                <input
                  type="text"
                  value={bodyFeelings}
                  onChange={(e) => setBodyFeelings(e.target.value)}
                  placeholder="例如：放松、有能量..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  能量水平
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as EnergyLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setEnergyLevel(level)}
                      className={`flex-1 py-2 rounded-lg transition-all ${
                        energyLevel === level
                          ? 'bg-sage-500 text-white'
                          : 'bg-sage-50 text-sage-600'
                      }`}
                    >
                      {level === 'low' ? '😌 低' : level === 'medium' ? '😊 中' : '💪 高'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">
                  备注（可选）
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录今天的练习感受..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            <Button onClick={handleComplete} size="full">
              保存记录
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronRightIcon = ({ size }: { size: number }) => (
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
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default Sequences;
