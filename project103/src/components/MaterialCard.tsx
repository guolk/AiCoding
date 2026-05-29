import React from 'react';
import { Heart, Play, Clock, Mic2 } from 'lucide-react';
import type { ListeningMaterial } from '../types';
import { 
  MaterialTypeLabels, 
  DifficultyLabels, 
  PracticeTypeLabels,
  AccentTypeLabels 
} from '../types';
import { formatTime, getDifficultyColor, getMaterialTypeColor } from '../utils';

interface MaterialCardProps {
  material: ListeningMaterial;
  onPlay?: (id: string) => void;
  onSelect?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  showActions?: boolean;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onPlay,
  onSelect,
  onToggleFavorite,
  showActions = true,
}) => {
  const typeColors: Record<string, string> = {
    news: 'from-blue-500 to-blue-600',
    ted: 'from-purple-500 to-purple-600',
    movie: 'from-pink-500 to-pink-600',
    song: 'from-indigo-500 to-indigo-600',
    podcast: 'from-teal-500 to-teal-600',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    news: <Mic2 className="w-6 h-6" />,
    ted: <Mic2 className="w-6 h-6" />,
    movie: <Play className="w-6 h-6" />,
    song: <Play className="w-6 h-6" />,
    podcast: <Mic2 className="w-6 h-6" />,
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group hover:-translate-y-1"
      onClick={() => onSelect?.(material.id)}
    >
      <div className={`relative h-32 bg-gradient-to-br ${typeColors[material.type] || 'from-gray-500 to-gray-600'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            {typeIcons[material.type]}
          </div>
        </div>
        
        {material.isFavorite && (
          <div className="absolute top-3 right-3">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${getDifficultyColor(material.difficulty)}`}>
            {DifficultyLabels[material.difficulty]}
          </span>
          <div className="flex items-center gap-1 text-white text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(material.duration)}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-[#1E3A5F] transition-colors">
          {material.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {material.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaterialTypeColor(material.type)}`}>
            {MaterialTypeLabels[material.type]}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#1E3A5F]/10 text-[#1E3A5F]">
            {PracticeTypeLabels[material.practiceType]}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {AccentTypeLabels[material.accent]}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{material.speaker}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(material.id);
                }}
                className={`p-2 rounded-full transition-colors ${material.isFavorite ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <Heart className={`w-5 h-5 ${material.isFavorite ? 'fill-red-500' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.(material.id);
                }}
                className="p-2 rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
