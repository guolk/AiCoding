import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, X, CheckCircle } from 'lucide-react';

const ingredientCategories = [
  { value: 'produce', label: '蔬菜水果' },
  { value: 'meat', label: '肉类' },
  { value: 'seafood', label: '海鲜' },
  { value: 'dairy', label: '乳制品' },
  { value: 'spice', label: '调料' },
  { value: 'pantry', label: ' pantry 食品' },
  { value: 'other', label: '其他' },
];

const generateId = () => Math.random().toString(36).substring(2, 15);

interface ShoppingListProps {
  meals?: any[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ meals = [] }) => {
  const [items, setItems] = useState<any[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    amount: 1,
    unit: 'g',
    category: 'produce'
  });

  useEffect(() => {
    if (meals.length > 0) {
      generateFromMeals(meals);
    }
  }, [meals]);

  const generateFromMeals = (mealList: any[]) => {
    const ingredientMap = new Map<string, any>();

    mealList.forEach(meal => {
      if (meal.recipe && meal.recipe.ingredients) {
        meal.recipe.ingredients.forEach((ing: any) => {
          const key = `${ing.name}-${ing.unit}`;
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.amount += ing.amount;
            if (!existing.recipeSources.includes(meal.recipe.name)) {
              existing.recipeSources.push(meal.recipe.name);
            }
          } else {
            ingredientMap.set(key, {
              amount: ing.amount,
              unit: ing.unit,
              category: ing.category || 'other',
              recipeSources: [meal.recipe.name]
            });
          }
        });
      }
    });

    const newItems: any[] = [];
    ingredientMap.forEach((value, key) => {
      const [name] = key.split('-');
      newItems.push({
        id: generateId(),
        ingredientName: name,
        amount: value.amount,
        unit: value.unit,
        category: value.category,
        purchased: false,
        inStock: false,
        recipeSources: value.recipeSources
      });
    });

    setItems(newItems);
  };

  const togglePurchased = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (!newItem.name.trim()) {
      alert('请输入食材名称');
      return;
    }

    setItems([...items, {
      id: generateId(),
      ingredientName: newItem.name,
      amount: newItem.amount,
      unit: newItem.unit,
      category: newItem.category,
      purchased: false,
      inStock: false,
      recipeSources: ['手动添加']
    }]);

    setNewItem({ name: '', amount: 1, unit: 'g', category: 'produce' });
    setShowAddItem(false);
  };

  const getItemsByCategory = () => {
    const grouped: Record<string, any[]> = {};
    ingredientCategories.forEach(cat => {
      grouped[cat.value] = [];
    });
    grouped['other'] = [];

    items.forEach(item => {
      const category = item.category || 'other';
      if (grouped[category]) {
        grouped[category].push(item);
      } else {
        grouped['other'].push(item);
      }
    });

    return grouped;
  };

  const groupedItems = getItemsByCategory();

  const purchasedCount = items.filter(i => i.purchased).length;
  const needToBuy = items.length - purchasedCount;

  const clearPurchased = () => {
    setItems(items.filter(item => !item.purchased));
  };

  const clearAll = () => {
    if (window.confirm('确定要清空购物清单吗？')) {
      setItems([]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">购物清单</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus size={18} />
            添加食材
          </button>
          {purchasedCount > 0 && (
            <button
              onClick={clearPurchased}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              清除已购
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              清空全部
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ShoppingCart size={18} />
            <span className="text-sm">需要购买</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{needToBuy}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CheckCircle size={18} />
            <span className="text-sm">已购买</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{purchasedCount} <span className="text-sm font-normal text-gray-500">/ {items.length}</span></p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <ShoppingCart size={64} className="mb-4" />
          <p className="text-lg mb-2">购物清单为空</p>
          <p className="text-sm">从周餐单生成或手动添加食材</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {ingredientCategories.map(category => {
              const categoryItems = groupedItems[category.value];
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.value} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-800">{category.label} ({categoryItems.length})</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {categoryItems.map((item: any) => (
                      <div
                        key={item.id}
                        className={`px-4 py-3 flex items-center gap-4 transition-colors ${
                          item.purchased ? 'bg-green-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={() => togglePurchased(item.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            item.purchased
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {item.purchased && '✓'}
                        </button>

                        <div className="flex-1">
                          <p className={`font-medium ${item.purchased ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {item.ingredientName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.amount} {item.unit} · 用于：{item.recipeSources?.join('、')}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">添加食材</h2>
              <button
                onClick={() => setShowAddItem(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">食材名称</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="例如：西红柿"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="g、个"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {ingredientCategories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={addItem}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
