import { Edit2, Trash2, Package } from 'lucide-react';
import type { Yarn } from '@/types';
import { Card } from '@/components/common/Card';
import ProgressBar from '@/components/common/ProgressBar';

interface MaterialCardProps {
  yarn: Yarn;
  onEdit?: (yarn: Yarn) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export default function MaterialCard({ yarn, onEdit, onDelete, onClick }: MaterialCardProps) {
  const remainingPercent = (yarn.remainingWeight / yarn.weight) * 100;
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-14 h-14 rounded-xl border-2 border-gray-200 shadow-inner flex-shrink-0"
            style={{ backgroundColor: yarn.colorHex }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{yarn.colorName}</h4>
            <p className="text-sm text-gray-500">{yarn.brand}</p>
            <p className="text-xs text-gray-400 mt-0.5">#{yarn.colorCode}</p>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(yarn);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(yarn.id);
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Package className="w-4 h-4" />
              <span>剩余量</span>
            </div>
            <span className="font-medium text-gray-900">
              {yarn.remainingWeight}g / {yarn.weight}g
            </span>
          </div>
          <ProgressBar progress={remainingPercent} size="sm" color={remainingPercent > 30 ? 'green' : 'orange'} />
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
            {yarn.category}
          </span>
        </div>
      </div>
    </Card>
  );
}
