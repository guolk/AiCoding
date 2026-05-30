import { Pencil, Eraser, PaintBucket, Grid3X3, Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { EditorSettings, SymmetrySettings } from '@/types';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  settings: EditorSettings;
  cellSize: number;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
  onCellSizeChange: (size: number) => void;
  onClear: () => void;
  onUndo?: () => void;
}

const tools = [
  { id: 'brush', label: '画笔', icon: Pencil },
  { id: 'eraser', label: '橡皮擦', icon: Eraser },
  { id: 'fill', label: '填充', icon: PaintBucket }
] as const;

export default function Toolbar({
  settings,
  cellSize,
  onSettingsChange,
  onCellSizeChange,
  onClear,
  onUndo
}: ToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">工具</h4>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = settings.tool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSettingsChange({ tool: tool.id })}
                title={tool.label}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
          
          <div className="w-px bg-gray-200 mx-1" />
          
          <button
            onClick={() => onSettingsChange({ showGrid: !settings.showGrid })}
            title="显示网格"
            className={cn(
              'p-2.5 rounded-lg transition-all duration-200',
              settings.showGrid
                ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          
          {onUndo && (
            <button
              onClick={onUndo}
              title="撤销"
              className="p-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={onClear}
            title="清空画布"
            className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">格子大小</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCellSizeChange(Math.max(8, cellSize - 4))}
            disabled={cellSize <= 8}
            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="flex-1 text-center text-sm text-gray-700 font-medium">
            {cellSize}px
          </span>
          <button
            onClick={() => onCellSizeChange(Math.min(40, cellSize + 4))}
            disabled={cellSize >= 40}
            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <input
          type="range"
          min="8"
          max="40"
          value={cellSize}
          onChange={(e) => onCellSizeChange(Number(e.target.value))}
          className="w-full mt-3 accent-emerald-600"
        />
      </div>
    </div>
  );
}

export function SymmetryPanel({
  symmetry,
  onChange
}: {
  symmetry: SymmetrySettings;
  onChange: (symmetry: Partial<SymmetrySettings>) => void;
}) {
  const symmetries = [
    { id: 'horizontal' as const, label: '水平对称' },
    { id: 'vertical' as const, label: '垂直对称' },
    { id: 'diagonal1' as const, label: '对角对称↘' },
    { id: 'diagonal2' as const, label: '对角对称↙' }
  ];

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100">
      <h4 className="text-sm font-medium text-gray-700 mb-3">对称设置</h4>
      <div className="space-y-2">
        {symmetries.map((sym) => (
          <label
            key={sym.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={symmetry[sym.id]}
              onChange={(e) => onChange({ [sym.id]: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">{sym.label}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h5 className="text-sm font-medium text-gray-700 mb-2">重复平铺</h5>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">横向</label>
            <input
              type="number"
              min="1"
              max="10"
              value={symmetry.repeatX}
              onChange={(e) => onChange({ repeatX: Math.max(1, Number(e.target.value)) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">纵向</label>
            <input
              type="number"
              min="1"
              max="10"
              value={symmetry.repeatY}
              onChange={(e) => onChange({ repeatY: Math.max(1, Number(e.target.value)) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
