import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface GpsUploadSectionProps {
  hasGpsData: boolean;
  onUpload: () => void;
  onClear: () => void;
}

export default function GpsUploadSection({ hasGpsData, onUpload, onClear }: GpsUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  if (hasGpsData) {
    return (
      <div className="flex items-center justify-between bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-green-800">GPS轨迹数据已导入</p>
            <p className="text-sm text-green-600">点击地图可查看详细轨迹</p>
          </div>
        </div>
        <button type="button" onClick={onClear} className="text-gray-400 hover:text-red-500 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-ocean-500 bg-ocean-50' : 'border-ocean-200 hover:border-ocean-400'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); onUpload(); }}
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-ocean-400" />
      <h4 className="font-semibold text-ocean-800 mb-2">上传GPS轨迹文件</h4>
      <p className="text-sm text-gray-500 mb-4">支持 GPX, KML, CSV 格式，或拖拽文件到此处</p>
      <button type="button" onClick={onUpload} className="btn-secondary inline-flex items-center gap-2">
        <Upload className="w-4 h-4" />
        选择文件
      </button>
      <p className="text-xs text-gray-400 mt-3">演示模式：点击按钮模拟GPS数据导入</p>
    </div>
  );
}
