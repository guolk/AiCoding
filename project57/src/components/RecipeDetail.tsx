import React from 'react';
import { Clock, ChefHat, Flame, ArrowLeft, Play } from 'lucide-react';

const cuisineLabels: Record<string, string> = {
  chinese: '中餐',
  western: '西餐',
  japanese: '日料',
  korean: '韩餐',
  thai: '泰国菜',
};

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

interface RecipeDetailProps {
  recipe: any;
  onBack: () => void;
  onEdit: () => void;
  onStartCooking: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onEdit, onStartCooking }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          返回列表
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            编辑
          </button>
          <button
            onClick={onStartCooking}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Play size={18} />
            开始烹饪
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-48 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6">
          <span className="text-7xl">🍳</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{recipe.name}</h1>
          <p className="text-gray-600">{recipe.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock size={16} />
              <span className="text-sm">准备时间</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{recipe.prepTime} 分钟</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock size={16} />
              <span className="text-sm">烹饪时间</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{recipe.cookTime} 分钟</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ChefHat size={16} />
              <span className="text-sm">份量</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{recipe.servings} 人份</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ChefHat size={16} />
              <span className="text-sm">难度</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              {difficultyLabels[recipe.difficulty] || recipe.difficulty}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {cuisineLabels[recipe.cuisine] || recipe.cuisine}
          </span>
          {recipe.tags.map((tag: string) => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">食材清单</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing: any) => (
                <li key={ing.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-800">{ing.name}</span>
                  <span className="text-gray-600">
                    {ing.amount} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              营养成分（每份）
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{recipe.nutrition.calories}</p>
                <p className="text-sm text-gray-600">卡路里 (kcal)</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{recipe.nutrition.protein}g</p>
                <p className="text-sm text-gray-600">蛋白质</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{recipe.nutrition.fat}g</p>
                <p className="text-sm text-gray-600">脂肪</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{recipe.nutrition.carbs}g</p>
                <p className="text-sm text-gray-600">碳水化合物</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">烹饪步骤</h2>
          <div className="space-y-4">
            {recipe.steps.map((step: any) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {step.order}
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                  <p className="text-gray-800 mb-2">{step.instruction}</p>
                  {step.duration && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      约 {step.duration} 分钟
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
