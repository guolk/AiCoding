import React from 'react';
import {
  MousePointer2,
  PenTool,
  Square,
  Ruler,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'select' | 'wall' | 'area' | 'dimension' | 'delete';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  scale: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onReset,
  scale,
}) => {
  const tools: { type: ToolType; icon: React.ReactNode; label: string }[] = [
    { type: 'select', icon: <MousePointer2 className="w-5 h-5" />, label: '选择' },
    { type: 'wall', icon: <PenTool className="w-5 h-5" />, label: '绘制墙体' },
    { type: 'area', icon: <Square className="w-5 h-5" />, label: '绘制区域' },
    { type: 'dimension', icon: <Ruler className="w-5 h-5" />, label: '标注尺寸' },
    { type: 'delete', icon: <Trash2 className="w-5 h-5" />, label: '删除' },
  ];

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onToolChange(tool.type)}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px]',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              activeTool === tool.type
                ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500 ring-offset-2'
                : 'text-gray-600'
            )}
            title={tool.label}
          >
              {tool.icon}
              <span className="text-xs mt-1 font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="缩小"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="放大"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title="重置视图"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
