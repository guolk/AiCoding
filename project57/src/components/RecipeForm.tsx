import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

const ingredientCategories = [
  { value: 'produce', label: '蔬菜水果' },
  { value: 'meat', label: '肉类' },
  { value: 'seafood', label: '海鲜' },
  { value: 'dairy', label: '乳制品' },
  { value: 'spice', label: '调料' },
  { value: 'pantry', label: ' pantry 食品' },
  { value: 'other', label: '其他' },
];

const cuisineOptions = [
  { value: 'chinese', label: '中餐' },
  { value: 'western', label: '西餐' },
  { value: 'japanese', label: '日料' },
  { value: 'korean', label: '韩餐' },
  { value: 'thai', label: '泰国菜' },
  { value: 'italian', label: '意大利菜' },
];

const difficultyOptions = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const generateId = () => Math.random().toString(36).substring(2, 15);

interface RecipeFormProps {
  recipe?: any;
  onSave: (recipe: any) => void;
  onCancel: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    prepTime: recipe?.prepTime || 10,
    cookTime: recipe?.cookTime || 15,
    servings: recipe?.servings || 2,
    cuisine: recipe?.cuisine || 'chinese',
    difficulty: recipe?.difficulty || 'easy',
    tags: recipe?.tags || [],
    ingredients: recipe?.ingredients || [],
    steps: recipe?.steps || [],
  });

  const [newTag, setNewTag] = useState('');

  const addIngredient = () => {
    const newIngredient = {
      id: generateId(),
      name: '',
      amount: 100,
      unit: 'g',
      category: 'produce',
    };
    setFormData({ ...formData, ingredients: [...formData.ingredients, newIngredient] });
  };

  const updateIngredient = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.map((ing: any) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      ),
    });
  };

  const removeIngredient = (id: string) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((ing: any) => ing.id !== id),
    });
  };

  const addStep = () => {
    const newStep = {
      id: generateId(),
      order: formData.steps.length + 1,
      instruction: '',
      duration: 5,
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const updateStep = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      steps: formData.steps.map((step: any) =>
        step.id === id ? { ...step, [field]: value } : step
      ),
    });
  };

  const removeStep = (id: string) => {
    const updatedSteps = formData.steps
      .filter((step: any) => step.id !== id)
      .map((step: any, index: number) => ({ ...step, order: index + 1 }));
    setFormData({ ...formData, steps: updatedSteps });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t: string) => t !== tag),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('请输入食谱名称');
      return;
    }
    if (formData.ingredients.length === 0) {
      alert('请至少添加一种食材');
      return;
    }
    if (formData.steps.length === 0) {
      alert('请至少添加一个步骤');
      return;
    }

    const savedRecipe = {
      ...recipe,
      ...formData,
      nutrition: recipe?.nutrition || { calories: 300, protein: 20, fat: 15, carbs: 25 },
      createdAt: recipe?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(savedRecipe);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          取消
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {recipe ? '编辑食谱' : '创建新食谱'}
        </h1>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Save size={18} />
          保存
        </button>
      </div>

      <form className="flex-1 overflow-y-auto space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">食谱名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例如：番茄炒蛋"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="简单描述这道菜..."
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">准备时间（分钟）</label>
              <input
                type="number"
                min="0"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">烹饪时间（分钟）</label>
              <input
                type="number"
                min="0"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">份量（人份）</label>
              <input
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {difficultyOptions.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">分类标签</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">菜系</label>
              <select
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {cuisineOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">自定义标签</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="输入标签后按回车添加"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">食材清单</h2>
          
          <div className="space-y-3 mb-4">
            {formData.ingredients.map((ingredient: any, index: number) => (
              <div key={ingredient.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                  placeholder="食材名称"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(ingredient.id, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="数量"
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                  placeholder="单位"
                  className="w-16 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
          >
            <Plus size={18} />
            添加食材
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">烹饪步骤</h2>
          
          <div className="space-y-4 mb-4">
            {formData.steps.map((step: any) => (
              <div key={step.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {step.order}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={step.instruction}
                    onChange={(e) => updateStep(step.id, 'instruction', e.target.value)}
                    rows={2}
                    placeholder="输入步骤说明..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">预计时间：</span>
                    <input
                      type="number"
                      value={step.duration || 0}
                      onChange={(e) => updateStep(step.id, 'duration', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <span className="text-sm text-gray-500">分钟</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
          >
            <Plus size={18} />
            添加步骤
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
