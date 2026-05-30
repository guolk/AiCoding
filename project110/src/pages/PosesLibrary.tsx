import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, ArrowLeft, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { usePoseStore } from '@/stores/poseStore';
import { usePracticeStore } from '@/stores/practiceStore';
import { Card } from '@/components/ui/Card';
import { DifficultyTag, MasteryTag } from '@/components/ui/Tags';
import { PoseCard } from '@/components/PoseCard';
import { Button } from '@/components/ui/Button';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { POSE_CATEGORIES, DIFFICULTY_LEVELS, MASTERY_LEVELS } from '@/types';
import { getCategoryLabel, getMasteryLabel } from '@/utils';

export const PosesLibrary: React.FC = () => {
  const { 
    filteredPoses, 
    setSelectedCategory, 
    setSelectedDifficulty, 
    setSearchQuery,
    selectedCategory,
    selectedDifficulty,
    searchQuery,
    filterPoses
  } = usePoseStore();
  
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    filterPoses();
  }, []);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSearchQuery('');
  };

  const hasFilters = selectedCategory || selectedDifficulty || searchQuery;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold text-sage-800 mb-2">
            体式库
          </h1>
          <p className="text-sage-600">探索 {filteredPoses.length} 种瑜伽体式</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage-400" />
              <input
                type="text"
                placeholder="搜索体式名称或功效..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-cream-300 bg-white/80 focus:outline-none focus:ring-2 focus:ring-sage-400 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                hasFilters 
                  ? 'bg-sage-100 border-sage-300 text-sage-700' 
                  : 'bg-white border-cream-300 text-sage-600 hover:bg-sage-50'
              }`}
            >
              <Filter size={20} />
              <span className="hidden md:inline">筛选</span>
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 rounded-xl text-sage-500 hover:text-sage-700 hover:bg-sage-50 transition-all"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-sage-700 mb-2 block">体式类型</label>
                  <div className="flex flex-wrap gap-2">
                    {POSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedCategory === cat.value
                            ? 'bg-sage-500 text-white'
                            : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-sage-700 mb-2 block">难度级别</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_LEVELS.map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === diff.value ? null : diff.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedDifficulty === diff.value
                            ? 'bg-sage-500 text-white'
                            : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                        }`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results */}
        {filteredPoses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPoses.map((pose) => (
              <PoseCard key={pose.id} pose={pose} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Search size={48} className="mx-auto text-sage-300 mb-4" />
            <p className="text-sage-500 mb-2">没有找到匹配的体式</p>
            <button
              onClick={clearFilters}
              className="text-sage-600 hover:text-sage-800 text-sm"
            >
              清除筛选条件
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};

export const PoseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPoseById, poses } = usePoseStore();
  const { getPoseProgress, setMasteryLevel } = usePracticeStore();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMasterySelector, setShowMasterySelector] = useState(false);
  
  const pose = id ? getPoseById(id) : undefined;
  const progress = pose ? getPoseProgress(pose.id) : null;
  
  const transitionsTo = pose?.transitionsTo.map(tid => poses.find(p => p.id === tid)).filter(Boolean);
  const transitionsFrom = pose?.transitionsFrom.map(tid => poses.find(p => p.id === tid)).filter(Boolean);

  if (!pose) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-sage-500">体式不存在</p>
        </Card>
      </div>
    );
  }

  const masteryPercentage = MASTERY_LEVELS.find(m => m.value === progress?.masteryLevel)?.percentage || 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-6"
        >
          <ArrowLeft size={20} />
          返回体式库
        </button>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-sage-100 to-cream-100">
              {pose.images.length > 0 ? (
                <img
                  src={pose.images[currentImageIndex]}
                  alt={pose.nameChinese}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sage-300">
                  <span className="text-6xl">🧘</span>
                </div>
              )}
            </div>
            {pose.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + pose.images.length) % pose.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % pose.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <DifficultyTag difficulty={pose.difficulty} />
              <span className="text-xs text-sage-600 bg-sage-50 px-3 py-1 rounded-full">
                {getCategoryLabel(pose.category)}
              </span>
            </div>
            
            <h1 className="font-display text-3xl font-semibold text-sage-800 mb-1">
              {pose.nameChinese}
            </h1>
            <p className="text-sage-500 italic mb-4">{pose.nameSanskrit}</p>

            {/* Progress */}
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-sage-500 mb-1">掌握程度</div>
                  {progress && <MasteryTag level={progress.masteryLevel} />}
                  {progress && progress.practiceCount > 0 && (
                    <div className="text-xs text-sage-400 mt-2">
                      已练习 {progress.practiceCount} 次
                    </div>
                  )}
                </div>
                <div className="relative">
                  <ProgressCircle progress={masteryPercentage} size={80} strokeWidth={6}>
                    <span className="text-xl font-semibold text-sage-700">{masteryPercentage}%</span>
                  </ProgressCircle>
                </div>
              </div>
              
              <div className="mt-4 relative">
                <Button
                  variant="secondary"
                  size="full"
                  onClick={() => setShowMasterySelector(!showMasterySelector)}
                >
                  更新进度
                </Button>
                
                {showMasterySelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg p-3 z-10">
                    {MASTERY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => {
                          setMasteryLevel(pose.id, level.value);
                          setShowMasterySelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          progress?.masteryLevel === level.value
                            ? 'bg-sage-100 text-sage-800'
                            : 'hover:bg-sage-50 text-sage-600'
                        }`}
                      >
                        {getMasteryLabel(level.value)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Benefits */}
            <div className="mb-4">
              <h3 className="font-semibold text-sage-800 mb-2">✨ 功效</h3>
              <p className="text-sage-600 text-sm leading-relaxed">{pose.benefits}</p>
            </div>

            {/* Contraindications */}
            <div>
              <h3 className="font-semibold text-sage-800 mb-2">⚠️ 禁忌人群</h3>
              <p className="text-sage-600 text-sm leading-relaxed">{pose.contraindications}</p>
            </div>
          </div>
        </div>

        {/* Precautions */}
        <Card className="mb-8">
          <h3 className="font-semibold text-sage-800 mb-3">📋 注意事项</h3>
          <ul className="space-y-2">
            {pose.precautions.map((precaution, index) => (
              <li key={index} className="flex items-start gap-2 text-sage-600 text-sm">
                <span className="text-sage-400 mt-0.5">•</span>
                {precaution}
              </li>
            ))}
          </ul>
        </Card>

        {/* Transitions */}
        {(transitionsTo && transitionsTo.length > 0) || (transitionsFrom && transitionsFrom.length > 0) ? (
          <div className="space-y-6">
            {transitionsFrom && transitionsFrom.length > 0 && (
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">← 可以从这些体式过渡</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {transitionsFrom.map((p) => p && (
                    <Card key={p.id} className="text-center py-4 hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-2xl mb-1">🧘</div>
                      <div className="text-sm font-medium text-sage-800">{p.nameChinese}</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {transitionsTo && transitionsTo.length > 0 && (
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">→ 可以过渡到这些体式</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {transitionsTo.map((p) => p && (
                    <Card key={p.id} className="text-center py-4 hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-2xl mb-1">🧘</div>
                      <div className="text-sm font-medium text-sage-800">{p.nameChinese}</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PosesLibrary;
