import { useState, useMemo } from 'react';
import { Search, Heart, X, BookOpen, AlertCircle, ChefHat, Star, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/Card';
import type { FoodItem } from '@/types';
import { cn } from '@/lib/utils';

const NATURE_FILTERS = [
  { value: 'all', label: '全部性味' },
  { value: '寒', label: '寒性' },
  { value: '热', label: '热性' },
  { value: '温', label: '温性' },
  { value: '凉', label: '凉性' },
  { value: '平', label: '平性' },
  { value: '微寒', label: '微寒' },
  { value: '微温', label: '微温' },
];

const EFFECT_FILTERS = [
  { value: 'all', label: '全部功效' },
  { value: '补', label: '补益' },
  { value: '清', label: '清热' },
  { value: '润', label: '润燥' },
  { value: '理', label: '理气' },
  { value: '活', label: '活血' },
  { value: '健', label: '健脾' },
  { value: '养', label: '养血' },
];

const NATURE_COLORS: Record<string, string> = {
  寒: 'bg-blue-100 text-blue-700',
  热: 'bg-red-100 text-red-700',
  温: 'bg-orange-100 text-orange-700',
  凉: 'bg-cyan-100 text-cyan-700',
  平: 'bg-gray-100 text-gray-700',
  微寒: 'bg-blue-50 text-blue-600',
  微温: 'bg-orange-50 text-orange-600',
};

function FoodDetailModal({
  food,
  isFavorite,
  onClose,
  onToggleFavorite,
}: {
  food: FoodItem;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-primary/5 to-secondary/5 z-10 px-6 py-4 border-b border-gray-100 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{food.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', NATURE_COLORS[food.nature] || NATURE_COLORS['平'])}>
                  {food.nature}
                </span>
                <span className="text-sm text-gray-500">味{food.flavor}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(food.id)}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  isFavorite
                    ? 'bg-red-50 text-red-500'
                    : 'bg-gray-100 text-gray-400 hover:text-red-500'
                )}
              >
                <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-5">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              性味归经
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-white/80 rounded-lg text-sm">
                <span className="text-gray-500">性味：</span>
                <span className="font-medium">{food.nature}，味{food.flavor}</span>
              </span>
              <span className="px-3 py-1.5 bg-white/80 rounded-lg text-sm">
                <span className="text-gray-500">归经：</span>
                <span className="font-medium">{food.meridian}</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-secondary" />
              功效
            </h4>
            <div className="flex flex-wrap gap-2">
              {food.effects.split('、').map((effect, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              用法用量
            </h4>
            <p className="text-gray-700 leading-relaxed">{food.usage}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h4 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              使用注意
            </h4>
            <p className="text-amber-700 text-sm leading-relaxed">
              药食同源食材虽有养生功效，但应根据个人体质合理选用。
              体质偏热者不宜多食温热性食材，体质偏寒者应慎用寒凉性食材。
              孕妇、哺乳期妇女及慢性病患者建议在专业医师指导下食用。
              如有不适，请立即停止食用并就医。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FoodCard({
  food,
  isFavorite,
  onClick,
  onToggleFavorite,
}: {
  food: FoodItem;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className="group relative"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(food.id);
        }}
        className={cn(
          'absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10',
          isFavorite
            ? 'bg-red-50 text-red-500'
            : 'bg-gray-100/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
        )}
      >
        <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
      </button>

      {isFavorite && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            已收藏
          </span>
        </div>
      )}

      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
            {food.name}
          </h3>
          <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', NATURE_COLORS[food.nature] || NATURE_COLORS['平'])}>
            {food.nature}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          味{food.flavor} · 归{food.meridian}
        </p>

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {food.effects}
        </p>

        <div className="mt-4 flex flex-wrap gap-1">
          {food.effects.split('、').slice(0, 3).map((effect, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-primary/5 text-primary/80 rounded text-xs"
            >
              {effect}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function FoodsPage() {
  const { foodItems, favoriteFoods, toggleFoodFavorite } = useAppStore();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [natureFilter, setNatureFilter] = useState('all');
  const [effectFilter, setEffectFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredFoods = useMemo(() => {
    let foods = [...foodItems];

    if (showFavoritesOnly) {
      foods = foods.filter(f => favoriteFoods.includes(f.id));
    }

    foods = foods.sort((a, b) => {
      const aFav = favoriteFoods.includes(a.id) ? 1 : 0;
      const bFav = favoriteFoods.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });

    if (natureFilter !== 'all') {
      foods = foods.filter(f => f.nature === natureFilter);
    }

    if (effectFilter !== 'all') {
      foods = foods.filter(f => f.effects.includes(effectFilter));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      foods = foods.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.effects.includes(query) ||
        f.nature.includes(query) ||
        f.flavor.includes(query) ||
        f.meridian.includes(query)
      );
    }

    return foods;
  }, [foodItems, favoriteFoods, searchQuery, natureFilter, effectFilter, showFavoritesOnly]);

  const handleToggleFavorite = (id: string) => {
    toggleFoodFavorite(id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">药食同源食材</h2>
            <p className="text-gray-500">
              30种经典药食同源食材，了解性味功效，科学养生
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium">
              共 {foodItems.length} 种食材
            </span>
            <span className="px-4 py-2 bg-red-50 text-red-500 rounded-xl font-medium">
              收藏 {favoriteFoods.length} 种
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索食材名称、性味、功效..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={natureFilter}
            onChange={(e) => setNatureFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          >
            {NATURE_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <select
            value={effectFilter}
            onChange={(e) => setEffectFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          >
            {EFFECT_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2',
              showFavoritesOnly
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Filter className="w-4 h-4" />
            {showFavoritesOnly ? '已收藏' : '全部'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredFoods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            isFavorite={favoriteFoods.includes(food.id)}
            onClick={() => setSelectedFood(food)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">未找到匹配的食材</h4>
          <p className="text-gray-500">请尝试其他搜索关键词或筛选条件</p>
        </Card>
      )}

      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          isFavorite={favoriteFoods.includes(selectedFood.id)}
          onClose={() => setSelectedFood(null)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
