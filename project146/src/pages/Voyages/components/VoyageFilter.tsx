import { Search, Filter } from 'lucide-react';
import type { Boat } from '../../../types';

interface VoyageFilterProps {
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  selectedBoat: string;
  showFilters: boolean;
  boats: Boat[];
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onBoatChange: (value: string) => void;
  onToggleFilters: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function VoyageFilter({
  searchQuery,
  dateFrom,
  dateTo,
  selectedBoat,
  showFilters,
  boats,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onBoatChange,
  onToggleFilters,
  onClear,
  hasActiveFilters,
}: VoyageFilterProps) {
  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索目的地或起点..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-ocean-50 border-ocean-400' : ''}`}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-ocean-600 transition-colors"
          >
            清除筛选
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-ocean-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">船艇</label>
            <select
              value={selectedBoat}
              onChange={(e) => onBoatChange(e.target.value)}
              className="input-field"
            >
              <option value="">全部船艇</option>
              {boats.map((boat) => (
                <option key={boat.id} value={boat.id}>{boat.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
