import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Mic2, Play, Film, Radio } from 'lucide-react';
import { MaterialCard } from '../components/MaterialCard';
import { useMaterialStore } from '../stores';
import { MaterialTypeLabels, DifficultyLabels, PracticeTypeLabels } from '../types';

const typeIcons: Record<string, React.ReactNode> = {
  news: <Radio className="w-4 h-4" />,
  ted: <BookOpen className="w-4 h-4" />,
  movie: <Film className="w-4 h-4" />,
  song: <Play className="w-4 h-4" />,
  podcast: <Mic2 className="w-4 h-4" />,
};

export const Materials: React.FC = () => {
  const navigate = useNavigate();
  const { filteredMaterials, filters, setFilters, toggleFavorite } = useMaterialStore();

  const materialTypes = ['news', 'ted', 'movie', 'song', 'podcast'] as const;
  const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
  const practiceTypes = ['intensive', 'extensive'] as const;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleTypeFilter = (type: string) => {
    setFilters({ type: filters.type === type ? null : type });
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setFilters({ difficulty: filters.difficulty === difficulty ? null : difficulty });
  };

  const handlePracticeTypeFilter = (practiceType: string) => {
    setFilters({ practiceType: filters.practiceType === practiceType ? null : practiceType });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">听力材料库</h1>
          <p className="text-gray-500">选择合适的材料开始练习</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索材料..."
            value={filters.search}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2.5 w-full md:w-72 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">筛选</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0 pt-1.5">类型：</span>
            {materialTypes.map(type => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filters.type === type ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {typeIcons[type]}
                {MaterialTypeLabels[type]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0 pt-1.5">难度：</span>
            {difficulties.map(difficulty => (
              <button
                key={difficulty}
                onClick={() => handleDifficultyFilter(difficulty)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filters.difficulty === difficulty ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {DifficultyLabels[difficulty]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0 pt-1.5">练习：</span>
            {practiceTypes.map(practiceType => (
              <button
                key={practiceType}
                onClick={() => handlePracticeTypeFilter(practiceType)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filters.practiceType === practiceType ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {PracticeTypeLabels[practiceType]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-500">
          共 <span className="font-semibold text-[#1E3A5F]">{filteredMaterials.length}</span> 个材料
        </p>
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onSelect={(id) => navigate(`/materials/${id}`)}
              onPlay={(id) => navigate(`/dictation/${id}`)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">没有找到匹配的材料</h3>
          <p className="text-gray-400">尝试调整筛选条件</p>
        </div>
      )}
    </div>
  );
};
