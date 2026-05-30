import React from 'react';
import { Lock, Star, Sparkles } from 'lucide-react';
import type { Achievement } from '../types';

interface Props {
  achievement: Achievement;
  onClick?: () => void;
}

export default function AchievementBadge({ achievement, onClick }: Props) {
  const { isUnlocked } = achievement;

  return (
    <div
      onClick={onClick}
      className={`card-hover cursor-pointer text-center relative overflow-hidden ${
        isUnlocked ? '' : 'grayscale opacity-70'
      }`}
    >
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
        </div>
      )}

      <div
        className={`text-5xl mb-3 ${
          isUnlocked ? 'animate-bounce-slow' : ''
        }`}
      >
        {isUnlocked ? achievement.icon : <Lock className="w-12 h-12 mx-auto text-neutral-400" />}
      </div>

      <h3
        className={`font-semibold mb-1 ${
          isUnlocked ? 'text-neutral-800' : 'text-neutral-500'
        }`}
      >
        {achievement.name}
      </h3>
      <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
        {isUnlocked ? achievement.description : '???'}
      </p>

      {isUnlocked && achievement.coinReward > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="flex items-center gap-1 text-primary-600">
            <Star className="w-4 h-4 fill-current" />
            +{achievement.coinReward}
          </span>
          <span className="flex items-center gap-1 text-secondary-600">
            <Sparkles className="w-4 h-4" />
            +{achievement.expReward} EXP
          </span>
        </div>
      )}

      {isUnlocked && achievement.unlockedAt && (
        <p className="text-xs text-neutral-400 mt-2">
          {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')} 解锁
        </p>
      )}
    </div>
  );
}
