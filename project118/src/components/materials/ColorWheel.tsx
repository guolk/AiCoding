import type { Yarn } from '@/types';

interface ColorWheelProps {
  yarns: Yarn[];
  selectedCategory?: string;
  onCategorySelect?: (category: string | null) => void;
}

const categoryColors: Record<string, string> = {
  '红色系': '#EF4444',
  '橙色系': '#F97316',
  '黄色系': '#EAB308',
  '绿色系': '#22C55E',
  '青色系': '#06B6D4',
  '蓝色系': '#3B82F6',
  '紫色系': '#A855F7',
  '黑色系': '#1F2937',
  '白色系': '#F3F4F6',
  '灰色系': '#9CA3AF'
};

export default function ColorWheel({ yarns, selectedCategory, onCategorySelect }: ColorWheelProps) {
  const categories = Object.entries(
    yarns.reduce<Record<string, Yarn[]>>((acc, yarn) => {
      if (!acc[yarn.category]) {
        acc[yarn.category] = [];
      }
      acc[yarn.category].push(yarn);
      return acc;
    }, {})
  ).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100">
      <h4 className="text-sm font-medium text-gray-700 mb-4">按色系分类</h4>
      
      {categories.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">暂无线材库存</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map(([category, categoryYarns]) => {
            const isSelected = selectedCategory === category;
            const color = categoryColors[category] || '#6B7280';
            
            return (
              <button
                key={category}
                onClick={() => onCategorySelect?.(isSelected ? null : category)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-emerald-50 ring-2 ring-emerald-500 ring-offset-2'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex -space-x-2">
                  {categoryYarns.slice(0, 3).map((yarn, i) => (
                    <div
                      key={yarn.id}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: yarn.colorHex, zIndex: 3 - i }}
                    />
                  ))}
                  {categoryYarns.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      +{categoryYarns.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-medium text-gray-700">{category}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({categoryYarns.length})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
