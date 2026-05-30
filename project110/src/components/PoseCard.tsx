import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { YogaPose } from '@/types';
import { Card } from '@/components/ui/Card';
import { DifficultyTag } from '@/components/ui/Tags';
import { getCategoryLabel, formatDuration } from '@/utils';

interface PoseCardProps {
  pose: YogaPose;
  showTransitionButton?: boolean;
  onAddToSequence?: (pose: YogaPose) => void;
}

export const PoseCard: React.FC<PoseCardProps> = ({
  pose,
  showTransitionButton = false,
  onAddToSequence,
}) => {
  return (
    <Link to={`/poses/${pose.id}`}>
      <Card className="group overflow-hidden p-0">
        <div className="relative h-40 bg-gradient-to-br from-sage-100 to-cream-100 flex items-center justify-center">
          <img
            src={pose.images[0]}
            alt={pose.nameChinese}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <DifficultyTag difficulty={pose.difficulty} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-sage-800 mb-1">
            {pose.nameChinese}
          </h3>
          <p className="text-xs text-sage-500 italic mb-2">{pose.nameSanskrit}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-sage-600 bg-sage-50 px-2 py-1 rounded-full">
              {getCategoryLabel(pose.category)}
            </span>
            <span className="text-xs text-sage-500 flex items-center gap-1">
              <Clock size={12} />
              {formatDuration(pose.defaultDuration)}
            </span>
          </div>
          {showTransitionButton && onAddToSequence && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToSequence(pose);
              }}
              className="mt-3 w-full py-2 text-sm text-sage-600 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors flex items-center justify-center gap-1"
            >
              添加到序列
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default PoseCard;
