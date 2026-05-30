import { Plus, Check, Palette } from 'lucide-react';
import { useState } from 'react';
import type { Yarn } from '@/types';
import { DEFAULT_COLORS } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';

interface ColorPaletteProps {
  currentColor: string;
  currentYarnId: string | null;
  yarns: Yarn[];
  onColorSelect: (color: string, yarnId?: string) => void;
  onAddYarn?: () => void;
}

export default function ColorPalette({
  currentColor,
  currentYarnId,
  yarns,
  onColorSelect,
  onAddYarn
}: ColorPaletteProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'yarn'>('quick');

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">当前颜色</h4>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-inner"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-xs text-gray-500 font-mono">{currentColor}</span>
          </div>
        </div>
        
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('quick')}
            className={cn(
              'flex-1 py-2 text-xs font-medium rounded-md transition-all',
              activeTab === 'quick'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            快速颜色
          </button>
          <button
            onClick={() => setActiveTab('yarn')}
            className={cn(
              'flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1',
              activeTab === 'yarn'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Palette className="w-3 h-3" />
            线材库
          </button>
        </div>
      </div>

      {activeTab === 'quick' ? (
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <div className="grid grid-cols-8 gap-1.5">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onColorSelect(color)}
                className={cn(
                  'w-8 h-8 rounded-lg transition-all duration-200 relative',
                  currentColor === color && 'ring-2 ring-emerald-500 ring-offset-2'
                )}
                style={{ backgroundColor: color }}
              >
                {currentColor === color && (
                  <Check className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-xs text-gray-500 mb-2">自定义颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={currentColor}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    onColorSelect(e.target.value);
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          {yarns.length === 0 ? (
            <div className="text-center py-8">
              <Palette className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 mb-4">还没有添加线材</p>
              {onAddYarn && (
                <button
                  onClick={onAddYarn}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加线材
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {yarns.map((yarn) => (
                  <button
                    key={yarn.id}
                    onClick={() => onColorSelect(yarn.colorHex, yarn.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
                      currentYarnId === yarn.id
                        ? 'bg-emerald-50 ring-2 ring-emerald-500/30'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: yarn.colorHex }}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {yarn.colorName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {yarn.brand} · {yarn.colorCode}
                      </p>
                    </div>
                    {currentYarnId === yarn.id && (
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {onAddYarn && (
                <button
                  onClick={onAddYarn}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加新线材
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
