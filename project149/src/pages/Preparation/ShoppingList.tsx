import { useState, useMemo } from 'react';
import { Download, Check, ShoppingCart, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import type { ShoppingItem, Menu } from '../../types';

interface ShoppingListProps {
  shoppingList: ShoppingItem[];
  guestCount: number;
  menu: Menu | null;
  onUpdate: (shoppingList: ShoppingItem[]) => void;
}

type IngredientCategory = 'vegetable' | 'meat' | 'seafood' | 'seasoning' | 'dairy' | 'grain' | 'fruit' | 'other';

const categoryConfig: Record<IngredientCategory, { label: string; color: string; icon: string }> = {
  vegetable: { label: '蔬菜类', color: 'bg-green-100 text-green-700', icon: '🥬' },
  meat: { label: '肉类', color: 'bg-red-100 text-red-700', icon: '🥩' },
  seafood: { label: '海鲜类', color: 'bg-blue-100 text-blue-700', icon: '🦐' },
  seasoning: { label: '调料类', color: 'bg-amber-100 text-amber-700', icon: '🧂' },
  dairy: { label: '乳制品', color: 'bg-purple-100 text-purple-700', icon: '🥛' },
  grain: { label: '谷物类', color: 'bg-yellow-100 text-yellow-700', icon: '🌾' },
  fruit: { label: '水果类', color: 'bg-pink-100 text-pink-700', icon: '🍎' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-700', icon: '📦' },
};

const vegetableKeywords = ['黄瓜', '木耳', '番茄', '西红柿', '土豆', '胡萝卜', '洋葱', '青椒', '红椒', '生菜', '紫甘蓝', '小番茄', '豆芽', '莴笋', '口蘑', '香菇', '草菇', '南瓜', '羽衣甘蓝', '鹰嘴豆', '银耳', '莲子', '红枣', '枸杞', '西柚', '橙子', '柠檬', '芒果', '牛油果'];
const meatKeywords = ['牛肉', '牛里脊', '牛腩', '羊肉', '羊排', '猪肉', '鸡腿', '鸡肉', '肉末', '蛋黄', '鸡蛋'];
const seafoodKeywords = ['鱼', '鲈鱼', '虾', '大虾', '蟹', '海鲜'];
const seasoningKeywords = ['盐', '糖', '酱油', '生抽', '老抽', '醋', '香醋', '料酒', '油', '橄榄油', '芝麻油', '黄油', '花椒', '干辣椒', '豆瓣酱', '郫县豆瓣酱', '花椒粉', '蒜末', '葱花', '姜', '大蒜', '八角', '桂皮', '番茄酱', '新疆番茄酱', '蜂蜜', '冰糖', '细砂糖', '糖粉', '香草荚', '可可粉', '抹茶粉', '洛神花', '玫瑰花', '迷迭香', '百里香', '香茅', '南姜', '青柠叶', '胡椒', '海盐', '味精', '鸡精'];
const dairyKeywords = ['牛奶', '淡奶油', '椰浆', '淡奶', '芝士', '马斯卡彭', '奶粉'];
const grainKeywords = ['面粉', '低筋面粉', '藜麦', '西米', '手指饼干', '米饭'];
const fruitKeywords = ['芒果', '橙子', '柠檬', '西柚', '小番茄', '牛油果'];

function getCategory(name: string): IngredientCategory {
  const lowerName = name.toLowerCase();
  if (vegetableKeywords.some(k => lowerName.includes(k.toLowerCase()))) return 'vegetable';
  if (meatKeywords.some(k => lowerName.includes(k.toLowerCase()))) return 'meat';
  if (seafoodKeywords.some(k => lowerName.includes(k.toLowerCase()))) return 'seafood';
  if (seasoningKeywords.some(k => lowerName.includes(k.toLowerCase()))) return 'seasoning';
  if (dairyKeywords.some(k => lowerName.includes(k.toLowerCase()))) return 'dairy';
  if (grainKeywords.some(k => lowerName.includes(k.toLowerCase()))) return 'grain';
  if (fruitKeywords.some(k => lowerName.includes(k.toLowerCase()))) return 'fruit';
  return 'other';
}

export function ShoppingList({ shoppingList, guestCount, menu, onUpdate }: ShoppingListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<IngredientCategory>>(
    new Set(['vegetable', 'meat', 'seafood', 'seasoning'])
  );

  const groupedItems = useMemo(() => {
    const grouped: Record<IngredientCategory, ShoppingItem[]> = {
      vegetable: [],
      meat: [],
      seafood: [],
      seasoning: [],
      dairy: [],
      grain: [],
      fruit: [],
      other: [],
    };

    shoppingList.forEach((item) => {
      const category = getCategory(item.name);
      grouped[category].push(item);
    });

    return grouped;
  }, [shoppingList]);

  const purchasedCount = shoppingList.filter((item) => item.purchased).length;
  const totalCount = shoppingList.length;
  const progress = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  const toggleCategory = (category: IngredientCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const togglePurchased = (itemName: string) => {
    const updated = shoppingList.map((item) =>
      item.name === itemName ? { ...item, purchased: !item.purchased, checked: !item.purchased } : item
    );
    onUpdate(updated);
  };

  const exportShoppingList = () => {
    const content = shoppingList
      .map((item) => `${item.purchased ? '✓' : '□'} ${item.name} - ${item.amount}${item.unit}`)
      .join('\n');
    
    const header = `采购清单 - ${menu?.name || '备餐计划'}\n` +
                   `人数: ${guestCount}人\n` +
                   `日期: ${new Date().toLocaleDateString('zh-CN')}\n` +
                   `采购进度: ${purchasedCount}/${totalCount} (${progress}%)\n` +
                   '─'.repeat(40) + '\n\n';

    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `采购清单_${new Date().toLocaleDateString('zh-CN')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryCount = (category: IngredientCategory) => {
    const items = groupedItems[category];
    const purchased = items.filter((i) => i.purchased).length;
    return { purchased, total: items.length };
  };

  return (
    <div className="space-y-6">
      <div className="bg-cream rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-primary-700 mb-1">
              采购进度
            </h3>
            <p className="text-sm text-gray-600">
              已采购 {purchasedCount} / {totalCount} 项食材
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportShoppingList}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出清单
          </Button>
        </div>
        <ProgressBar
          value={purchasedCount}
          max={totalCount}
          variant={progress === 100 ? 'success' : 'primary'}
          size="lg"
          showLabel
          label="采购完成度"
          animated={progress > 0 && progress < 100}
          striped={progress > 0 && progress < 100}
        />
      </div>

      <div className="space-y-4">
        {Object.entries(groupedItems).map(([categoryKey, items]) => {
          if (items.length === 0) return null;
          
          const category = categoryKey as IngredientCategory;
          const config = categoryConfig[category];
          const isExpanded = expandedCategories.has(category);
          const { purchased, total } = getCategoryCount(category);
          const isComplete = purchased === total;

          return (
            <div
              key={category}
              className="border border-gray-100 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className={clsx(
                  'w-full px-4 py-3 flex items-center justify-between transition-colors',
                  isComplete ? 'bg-green-50 hover:bg-green-100' : 'bg-white hover:bg-cream/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <span className="font-medium text-primary-700">{config.label}</span>
                  <Badge variant={isComplete ? 'success' : 'outline'} size="sm">
                    {purchased}/{total}
                  </Badge>
                </div>
                <svg
                  className={clsx(
                    'w-5 h-5 text-gray-400 transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className={clsx(
                        'px-4 py-3 flex items-center gap-4 transition-colors',
                        item.purchased ? 'bg-green-50/50' : 'hover:bg-cream/30'
                      )}
                    >
                      <button
                        onClick={() => togglePurchased(item.name)}
                        className={clsx(
                          'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          item.purchased
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-primary-400'
                        )}
                      >
                        {item.purchased && <Check className="w-4 h-4" />}
                      </button>

                      <div className="flex-1">
                        <p className={clsx(
                          'font-medium',
                          item.purchased ? 'text-gray-400 line-through' : 'text-primary-700'
                        )}>
                          {item.name}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={clsx(
                          'font-semibold',
                          item.purchased ? 'text-gray-400' : 'text-primary-600'
                        )}>
                          {item.amount} {item.unit}
                        </p>
                        <p className="text-xs text-gray-400">
                          约 {guestCount} 人份
                        </p>
                      </div>

                      <Badge
                        variant={item.purchased ? 'success' : 'secondary'}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {item.purchased ? '已采购' : '未采购'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {shoppingList.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-primary-700 mb-2">
            暂无采购清单
          </h3>
          <p className="text-gray-500">
            选择菜单后将自动生成食材采购清单
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-8 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-gray-600">
            共 {totalCount} 项食材
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">
            已完成 {purchasedCount} 项
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gold-500" />
          <span className="text-sm text-gray-600">
            待采购 {totalCount - purchasedCount} 项
          </span>
        </div>
      </div>
    </div>
  );
}
