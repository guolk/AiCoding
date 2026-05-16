import React, { useState } from 'react';
import { Clock, ChefHat, Flame, Filter, Plus, Search, X } from 'lucide-react';

const cuisineOptions = [
  { value: 'chinese', label: '中餐' },
  { value: 'western', label: '西餐' },
  { value: 'japanese', label: '日料' },
  { value: 'korean', label: '韩餐' },
  { value: 'thai', label: '泰国菜' },
];

const difficultyOptions = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

interface RecipeListProps {
  recipes: any[];
  onSelectRecipe: (recipe: any) => void;
  onAddRecipe: () => void;
  onEditRecipe: (recipe: any) => void;
  onDeleteRecipe: (id: string) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onSelectRecipe,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: '',
    cookingMethod: '',
    dietType: '',
    difficulty: '',
  });

  const filteredRecipes = recipes.filter((recipe: any) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCuisine = !filters.cuisine || recipe.cuisine === filters.cuisine;
    const matchesDifficulty = !filters.difficulty || recipe.difficulty === filters.difficulty;

    return matchesSearch && matchesCuisine && matchesDifficulty;
  });

  const clearFilters = () => {
    setFilters({ cuisine: '', cookingMethod: '', dietType: '', difficulty: '' });
    setSearchTerm('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficultyOptions.find(d => d.value === difficulty)?.label || difficulty;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">食谱库</h1>
        <button
          onClick={onAddRecipe}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus size={20} />
          添加食谱
        </button>
      </div>

      <div className="mb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索食谱名称、描述或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Filter size={16} />
            {showFilters ? '收起筛选' : '展开筛选'}
          </button>
          {(filters.cuisine || filters.difficulty || searchTerm) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <X size={14} />
              清除筛选
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">菜系</label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">全部</option>
                {cuisineOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">全部</option>
                {difficultyOptions.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ChefHat size={64} className="mb-4 text-gray-300" />
            <p className="text-lg">没有找到匹配的食谱</p>
            <p className="text-sm">尝试调整筛选条件或添加新食谱</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe: any) => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onSelectRecipe(recipe)}
              >
                <div className="h-40 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-5xl">🍳</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{recipe.prepTime + recipe.cookTime}分钟</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame size={14} />
                      <span>{recipe.nutrition.calories}卡</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat size={14} />
                      <span>{recipe.servings}人份</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditRecipe(recipe); }}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteRecipe(recipe.id); }}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
