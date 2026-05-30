import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import GameCard from '@/components/games/GameCard';
import { Search, Plus, Filter, X } from 'lucide-react';
import { CollectionStatus } from '@/types';
import { getCollectionStatusLabel } from '@/utils/helpers';

const statusOptions: { value: CollectionStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'owned', label: '已拥有' },
  { value: 'wishlist', label: '愿望清单' },
  { value: 'lent', label: '已借出' },
  { value: 'sold', label: '已出售' },
];

export default function Collection() {
  const { games, collectionItems } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CollectionStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const getCollectionItemForGame = (gameId: string) => {
    return collectionItems.find((c) => c.gameId === gameId);
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      game.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const collectionItem = getCollectionItemForGame(game.id);
    
    if (statusFilter === 'all') {
      return matchesSearch;
    }

    return matchesSearch && collectionItem?.status === statusFilter;
  });

  const gamesWithCollection = filteredGames.map((game) => ({
    game,
    collectionItem: getCollectionItemForGame(game.id),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">游戏收藏</h1>
          <p className="text-gray-400 mt-1">管理您的桌游收藏和愿望清单</p>
        </div>
        <Link to="/collection/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">添加游戏</span>
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="搜索游戏名称、出版社或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${
              showFilters ? 'border-accent-500/50' : ''
            }`}
          >
            <Filter className="w-5 h-5" />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-100">
            <p className="text-sm text-gray-400 mb-2">收藏状态</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === option.value
                      ? 'bg-accent-500 text-surface-900'
                      : 'bg-surface-200 text-gray-300 hover:bg-surface-100'
                  }`}
                >
                  {option.label}
                  {option.value !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-75">
                      ({collectionItems.filter((c) => c.status === option.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {gamesWithCollection.map(({ game, collectionItem }) => (
          <GameCard key={game.id} game={game} collectionItem={collectionItem} />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg">没有找到匹配的游戏</p>
          <p className="text-gray-500 text-sm mt-2">尝试调整搜索条件或筛选器</p>
        </div>
      )}
    </div>
  );
}
