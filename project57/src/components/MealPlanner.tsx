import React, { useState } from 'react';
import { ChefHat, Plus, X, Trash2, Target, Calendar, Sparkles } from 'lucide-react';

const daysOfWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const generateId = () => Math.random().toString(36).substring(2, 15);

interface MealPlannerProps {
  recipes: any[];
  onGenerateShoppingList: (meals: any[]) => void;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ recipes, onGenerateShoppingList }) => {
  const [meals, setMeals] = useState<any[]>([]);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(2000);
  const [showRecipeSelector, setShowRecipeSelector] = useState<{ day: number; meal: string } | null>(null);

  const getMealSlot = (day: number, mealType: string) => {
    return meals.find(m => m.day === day && m.mealType === mealType);
  };

  const addRecipeToMeal = (recipe: any) => {
    if (!showRecipeSelector) return;

    const existingMeal = meals.find(
      m => m.day === showRecipeSelector.day && m.mealType === showRecipeSelector.meal
    );

    if (existingMeal) {
      setMeals(meals.map(m => 
        m.day === showRecipeSelector.day && m.mealType === showRecipeSelector.meal
          ? { ...m, recipe }
          : m
      ));
    } else {
      setMeals([...meals, {
        id: generateId(),
        day: showRecipeSelector.day,
        mealType: showRecipeSelector.meal,
        recipe
      }]);
    }

    setShowRecipeSelector(null);
  };

  const removeMeal = (day: number, mealType: string) => {
    setMeals(meals.filter(m => !(m.day === day && m.mealType === mealType)));
  };

  const getDayCalories = (day: number) => {
    const dayMeals = meals.filter(m => m.day === day);
    return dayMeals.reduce((sum, meal) => sum + meal.recipe.nutrition.calories, 0);
  };

  const getTotalCalories = () => {
    return meals.reduce((sum, meal) => sum + meal.recipe.nutrition.calories, 0);
  };

  const generateSuggestions = () => {
    const suggestions: any[] = [];
    const caloriesPerMeal = Math.round(dailyCalorieTarget / 3);

    for (let day = 0; day < 7; day++) {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const hasMeal = meals.some(m => m.day === day && m.mealType === mealType);
        if (!hasMeal) {
          const suitableRecipes = recipes.filter(
            r => Math.abs(r.nutrition.calories - caloriesPerMeal) <= 100
          );
          if (suitableRecipes.length > 0) {
            const randomRecipe = suitableRecipes[Math.floor(Math.random() * suitableRecipes.length)];
            suggestions.push({
              id: generateId(),
              day,
              mealType,
              recipe: randomRecipe
            });
          }
        }
      });
    }

    if (suggestions.length > 0 && window.confirm(`✨ 为您找到 ${suggestions.length} 个推荐食谱，是否应用？`)) {
      setMeals([...meals, ...suggestions]);
    } else if (suggestions.length === 0) {
      alert('没有找到合适的推荐食谱');
    }
  };

  const handleGenerateShoppingList = () => {
    if (meals.length === 0) {
      alert('请先添加餐食到计划中');
      return;
    }
    onGenerateShoppingList(meals);
  };

  const mealTypes = [
    { value: 'breakfast', label: '早餐', icon: '🌅' },
    { value: 'lunch', label: '午餐', icon: '☀️' },
    { value: 'dinner', label: '晚餐', icon: '🌙' },
    { value: 'snack', label: '加餐', icon: '🍪' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">周餐单规划</h1>
        <div className="flex gap-2">
          <button
            onClick={generateSuggestions}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Sparkles size={18} />
            智能推荐
          </button>
          <button
            onClick={handleGenerateShoppingList}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus size={18} />
            生成购物清单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Target size={18} />
            <span className="text-sm">每日热量目标</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={dailyCalorieTarget}
              onChange={(e) => setDailyCalorieTarget(parseInt(e.target.value) || 2000)}
              className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-lg font-semibold"
            />
            <span className="text-gray-600">kcal</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar size={18} />
            <span className="text-sm">本周总热量</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{getTotalCalories()} <span className="text-sm font-normal text-gray-500">kcal</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ChefHat size={18} />
            <span className="text-sm">已规划餐数</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{meals.length} <span className="text-sm font-normal text-gray-500">/ 28</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ChefHat size={18} />
            <span className="text-sm">食谱总数</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{recipes.length} <span className="text-sm font-normal text-gray-500">个</span></p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[800px]">
          {daysOfWeek.map((day, dayIndex) => (
            <div key={dayIndex} className="flex flex-col">
              <div className="bg-gray-100 p-2 rounded-t-lg text-center font-medium text-gray-700">
                {day}
              </div>
              <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg flex-1 p-2 space-y-2">
                <div className="p-2 bg-orange-50 rounded-lg text-center">
                  <span className="text-sm font-medium text-orange-600">
                    {getDayCalories(dayIndex)} kcal
                  </span>
                </div>

                {mealTypes.map(mealType => {
                  const meal = getMealSlot(dayIndex, mealType.value);
                  return (
                    <div key={mealType.value} className="relative">
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <span>{mealType.icon}</span>
                        <span>{mealType.label}</span>
                      </div>
                      {meal ? (
                        <div className="p-2 bg-indigo-100 rounded-lg border border-indigo-200 relative group">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {meal.recipe.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {meal.recipe.nutrition.calories} kcal
                          </p>
                          <button
                            onClick={() => removeMeal(dayIndex, mealType.value)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRecipeSelector({ day: dayIndex, meal: mealType.value })}
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={16} />
                          <span className="text-sm">添加</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRecipeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                选择食谱 - {daysOfWeek[showRecipeSelector.day]} {mealTypes.find(m => m.value === showRecipeSelector.meal)?.label}
              </h2>
              <button
                onClick={() => setShowRecipeSelector(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => addRecipeToMeal(recipe)}
                  className="w-full p-4 rounded-lg text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  <p className="font-medium text-gray-800">{recipe.name}</p>
                  <p className="text-sm text-gray-500">
                    {recipe.nutrition.calories} kcal · {recipe.nutrition.protein.toFixed(1)}g 蛋白
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
