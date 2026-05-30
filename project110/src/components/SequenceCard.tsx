import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play, Edit2, Trash2, Star } from 'lucide-react';
import { YogaSequence } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTargetGoalLabel, formatDuration } from '@/utils';

interface SequenceCardProps {
  sequence: YogaSequence;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const goalColors: Record<string, string> = {
  'stress-relief': 'from-blue-400 to-indigo-400',
  'strength': 'from-orange-400 to-red-400',
  'flexibility': 'from-purple-400 to-pink-400',
  'relaxation': 'from-green-400 to-teal-400',
  'energy': 'from-yellow-400 to-orange-400',
};

export const SequenceCard: React.FC<SequenceCardProps> = ({
  sequence,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const gradientClass = goalColors[sequence.targetGoal] || 'from-sage-400 to-sage-600';

  return (
    <Card className="overflow-hidden p-0 hover:shadow-lg transition-all duration-300">
      <div className={`h-24 bg-gradient-to-r ${gradientClass} relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 right-3">
          {sequence.isBuiltIn && (
            <span className="flex items-center gap-1 text-xs text-white/80 bg-black/20 px-2 py-1 rounded-full">
              <Star size={12} fill="currentColor" />
              内置序列
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-4">
          <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
            {getTargetGoalLabel(sequence.targetGoal)}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-sage-800 mb-1">
          {sequence.name}
        </h3>
        <p className="text-sm text-sage-500 line-clamp-2 mb-3">
          {sequence.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-sage-600 mb-4">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(sequence.totalDuration)}
          </span>
          <span>{sequence.poses.length} 个体式</span>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/sequences/${sequence.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              <Play size={14} />
              开始练习
            </Button>
          </Link>
          
          {showActions && !sequence.isBuiltIn && (
            <>
              {onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEdit}
                  className="px-3"
                >
                  <Edit2 size={14} />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SequenceCard;
