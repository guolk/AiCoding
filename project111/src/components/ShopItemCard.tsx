import React from 'react';
import type { ShopItem } from '../types';
import { Star } from 'lucide-react';
import { SHOP_CATEGORY_LABELS } from '../types';

interface Props {
  item: ShopItem;
  userCoins: number;
  onRedeem: (item: ShopItem) => void;
}

const categoryColors = {
  screen_time: 'from-blue-50 to-blue-100 border-blue-200',
  pocket_money: 'from-green-50 to-green-100 border-green-200',
  privilege: 'from-purple-50 to-purple-100 border-purple-200',
  other: 'from-orange-50 to-orange-100 border-orange-200',
};

export default function ShopItemCard({ item, userCoins, onRedeem }: Props) {
  const canAfford = userCoins >= item.priceCoins;

  return (
    <div className={`card-hover bg-gradient-to-br ${categoryColors[item.category]} border-2`}>
      <div className="text-center">
        <div className="text-5xl mb-4 animate-float-slow">{item.icon}</div>
        
        <span className="inline-block px-2 py-0.5 bg-white/80 rounded-full text-xs font-medium text-neutral-600 mb-2">
          {SHOP_CATEGORY_LABELS[item.category]}
        </span>
        
        <h3 className="font-display text-lg text-neutral-800 mb-1">
          {item.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          {item.description}
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-5 h-5 text-primary-500 fill-current" />
          <span className="text-2xl font-bold text-primary-600">
            {item.priceCoins}
          </span>
        </div>
        
        <button
          onClick={() => onRedeem(item)}
          disabled={!canAfford}
          className={`w-full btn-primary py-2 text-sm ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {canAfford ? '🎁 兑换' : '💰 金币不足'}
        </button>
      </div>
    </div>
  );
}
