import { useState, useMemo } from 'react';
import { Check, AlertTriangle, Utensils, Flame, Wrench, Package, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import type { EquipmentItem } from '../../types';

interface EquipmentChecklistProps {
  equipmentChecklist: EquipmentItem[];
  onUpdate: (equipmentChecklist: EquipmentItem[]) => void;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  '烹饪器具': { 
    label: '烹饪器具', 
    icon: <Flame className="w-5 h-5" />,
    color: 'bg-gold-100 text-gold-600'
  },
  '工具': { 
    label: '工具', 
    icon: <Wrench className="w-5 h-5" />,
    color: 'bg-primary-100 text-primary-600'
  },
  '设备': { 
    label: '设备', 
    icon: <Package className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-600'
  },
  '容器': { 
    label: '容器', 
    icon: <Utensils className="w-5 h-5" />,
    color: 'bg-green-100 text-green-600'
  },
  '耗材': { 
    label: '耗材', 
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-600'
  },
  '餐具': { 
    label: '餐具', 
    icon: <Utensils className="w-5 h-5" />,
    color: 'bg-coral-100 text-coral-600'
  },
  '摆台物品': { 
    label: '摆台物品', 
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-pink-100 text-pink-600'
  },
};

const defaultCategories = ['烹饪器具', '工具', '设备', '容器', '耗材', '餐具', '摆台物品'];

export function EquipmentChecklist({ equipmentChecklist, onUpdate }: EquipmentChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(defaultCategories)
  );

  const allItems = useMemo(() => {
    const categories = new Set(equipmentChecklist.map((item) => item.category));
    defaultCategories.forEach((c) => categories.add(c));
    return Array.from(categories);
  }, [equipmentChecklist]);

  const groupedItems = useMemo(() => {
    const grouped: Record<string, EquipmentItem[]> = {};
    
    allItems.forEach((category) => {
      grouped[category] = equipmentChecklist.filter((item) => item.category === category);
    });

    const tableSettingItems: EquipmentItem[] = [
      { name: '餐盘', category: '摆台物品', checked: true },
      { name: '汤碗', category: '摆台物品', checked: true },
      { name: '筷子', category: '摆台物品', checked: true },
      { name: '汤勺', category: '摆台物品', checked: true },
      { name: '餐巾', category: '摆台物品', checked: true },
      { name: '餐垫', category: '摆台物品', checked: false },
      { name: '烛台', category: '摆台物品', checked: false },
      { name: '纸巾', category: '摆台物品', checked: true },
    ];

    if (grouped['摆台物品']) {
      grouped['摆台物品'] = [...grouped['摆台物品'], ...tableSettingItems];
    } else {
      grouped['摆台物品'] = tableSettingItems;
    }

    return grouped;
  }, [equipmentChecklist, allItems]);

  const checkedCount = equipmentChecklist.length + 8;
  const allCheckedCount = equipmentChecklist.filter((i) => i.checked).length +
    (groupedItems['摆台物品']?.filter((i) => i.checked).length || 0);
  
  const progress = checkedCount > 0 ? Math.round((allCheckedCount / checkedCount) * 100) : 0;

  const uncheckedItems = useMemo(() => {
    const all: Array<{ name: string; category: string }> = [];
    
    Object.entries(groupedItems).forEach(([category, items]) => {
      items.forEach((item) => {
        if (!item.checked) {
          all.push({ name: item.name, category });
        }
      });
    });
    
    return all;
  }, [groupedItems]);

  const toggleCategory = (category: string) => {
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

  const toggleItem = (itemName: string, category: string) => {
    if (category === '摆台物品') {
      const tableSettingItems = groupedItems['摆台物品']?.map((item) =>
        item.name === itemName ? { ...item, checked: !item.checked } : item
      ) || [];
      
      const otherItems = equipmentChecklist.filter((i) => i.category !== '摆台物品');
      onUpdate([...otherItems, ...tableSettingItems]);
    } else {
      const updated = equipmentChecklist.map((item) =>
        item.name === itemName && item.category === category
          ? { ...item, checked: !item.checked }
          : item
      );
      onUpdate(updated);
    }
  };

  const getCategoryCount = (category: string) => {
    const items = groupedItems[category] || [];
    const checked = items.filter((i) => i.checked).length;
    return { checked, total: items.length };
  };

  return (
    <div className="space-y-6">
      <div className="bg-cream rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-primary-700 mb-1">
              检查进度
            </h3>
            <p className="text-sm text-gray-600">
              已检查 {allCheckedCount} / {checkedCount} 项
            </p>
          </div>
          {uncheckedItems.length > 0 && uncheckedItems.length <= 5 && (
            <div className="flex items-center gap-2 text-coral-600 bg-coral-50 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                还有 {uncheckedItems.length} 项未检查
              </span>
            </div>
          )}
        </div>
        <ProgressBar
          value={allCheckedCount}
          max={checkedCount}
          variant={progress === 100 ? 'success' : 'primary'}
          size="lg"
          showLabel
          label="设备检查完成度"
          animated={progress > 0 && progress < 100}
          striped={progress > 0 && progress < 100}
        />
      </div>

      {uncheckedItems.length > 0 && (
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-coral-600" />
            <h4 className="font-semibold text-coral-700">待检查项目</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {uncheckedItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-coral-200"
              >
                <span className="text-sm text-coral-700">{item.name}</span>
                <Badge variant="outline" size="sm">{item.category}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allItems.map((category) => {
          const items = groupedItems[category] || [];
          if (items.length === 0) return null;

          const config = categoryConfig[category] || {
            label: category, icon: <Package className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600'
          };
          const isExpanded = expandedCategories.has(category);
          const { checked, total } = getCategoryCount(category);
          const isComplete = checked === total;

          return (
            <div
              key={category}
              className={clsx(
                'border rounded-xl overflow-hidden transition-all',
                isComplete ? 'border-green-200' : 'border-gray-100'
              )}
            >
              <button
                onClick={() => toggleCategory(category)}
                className={clsx(
                  'w-full px-4 py-3 flex items-center justify-between transition-colors',
                  isComplete ? 'bg-green-50 hover:bg-green-100' : 'bg-white hover:bg-cream/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', config.color)}>
                    {config.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-primary-700">{config.label}</p>
                    <p className="text-xs text-gray-500">
                      {checked}/{total} 项已检查
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isComplete ? 'success' : 'outline'} size="sm">
                    {isComplete ? '已完成' : `${Math.round((checked / total) * 100)}%`}
                  </Badge>
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
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className={clsx(
                        'px-4 py-3 flex items-center gap-4 transition-colors',
                        item.checked
                          ? 'bg-green-50/50'
                          : 'bg-white hover:bg-cream/30',
                        !item.checked && 'animate-pulse-soft'
                      )}
                    >
                      <button
                        onClick={() => toggleItem(item.name, category)}
                        className={clsx(
                          'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          item.checked
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-primary-400'
                        )}
                      >
                        {item.checked && <Check className="w-4 h-4" />}
                      </button>

                      <div className="flex-1">
                        <p className={clsx(
                          'font-medium',
                          item.checked ? 'text-gray-400 line-through' : 'text-primary-700'
                        )}>
                          {item.name}
                        </p>
                      </div>

                      <Badge
                        variant={item.checked ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {item.checked ? '已检查' : '未检查'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {equipmentChecklist.length === 0 && Object.keys(groupedItems).length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-primary-700 mb-2">
            暂无设备清单
          </h3>
          <p className="text-gray-500">
            选择菜单后将自动生成所需设备清单
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-8 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">{allCheckedCount}</p>
          <p className="text-sm text-gray-500">已检查</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-coral-600">{uncheckedItems.length}</p>
          <p className="text-sm text-gray-500">待检查</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gold-600">{checkedCount}</p>
          <p className="text-sm text-gray-500">总计</p>
        </div>
        <div className="w-px h-10 bg-gray-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{progress}%</p>
          <p className="text-sm text-gray-500">完成率</p>
        </div>
      </div>
    </div>
  );
}
