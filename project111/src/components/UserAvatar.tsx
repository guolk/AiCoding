import React from 'react';
import { Star } from 'lucide-react';
import type { User } from '../types';
import { calculateLevel } from '../data/mockData';

interface Props {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  showCoins?: boolean;
}

const sizeConfig = {
  sm: { avatar: 'text-2xl', level: 'w-5 h-5 text-xs', container: 'w-12 h-12' },
  md: { avatar: 'text-3xl', level: 'w-6 h-6 text-xs', container: 'w-14 h-14' },
  lg: { avatar: 'text-5xl', level: 'w-8 h-8 text-sm', container: 'w-20 h-20' },
  xl: { avatar: 'text-7xl', level: 'w-10 h-10 text-base', container: 'w-28 h-28' },
};

export default function UserAvatar({
  user,
  size = 'md',
  showLevel = true,
  showCoins = false,
}: Props) {
  const config = sizeConfig[size];
  const { level } = calculateLevel(user.expPoints);

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${config.container}`}>
        <div
          className={`${config.container} rounded-full bg-gradient-warm flex items-center justify-center shadow-glow animate-pulse-glow`}
        >
          <span className={config.avatar}>{user.avatarUrl}</span>
        </div>
        {showLevel && (
          <div
            className={`absolute -bottom-1 -right-1 ${config.level} rounded-full bg-secondary-500 text-white font-bold flex items-center justify-center shadow-md`}
          >
            {level}
          </div>
        )}
      </div>
      {(showCoins || size === 'sm') && (
        <div>
          <p className="font-semibold text-neutral-800">{user.roleName}</p>
          {showCoins && (
            <div className="flex items-center gap-1 text-sm text-primary-600">
              <Star className="w-4 h-4 fill-current" />
              <span>{user.coins} 金币</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
