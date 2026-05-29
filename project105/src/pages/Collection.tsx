import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, List, Filter, Search, MapPin, Calendar, Tag, Plus } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import StatusBadge from '../components/common/StatusBadge';
import { SetStatus } from '../types';
import { STATUS_LABELS } from '../utils/constants';
import { formatDate, formatCurrency, truncateString } from '../utils/helpers';

const statusOptions: { value: SetStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'owned', label: STATUS_LABELS.owned },
  { value: 'building', label: STATUS_LABELS.building },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'disassembled', label: STATUS_LABELS.disassembled },
  { value: 'wishlist', label: STATUS_LABELS.wishlist },
];

export default function Collection() {
  const navigate = useNavigate();
  const { sets, searchQuery, activeView, setActiveView } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<SetStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredSets = sets.filter((set) => {
    const matchesStatus = filterStatus === 'all' || set.status === filterStatus;
    const matchesSearch = !searchQuery || 
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.set_num.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.theme.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-brick transition-all ${
              showFilters
                ? 'bg-lego-blue text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-lego-blue'
            }`}
          >
            <Filter size={18} />
            <span>筛选</span>
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SetStatus | 'all')}
            className="brick-input w-40"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            共 {filteredSets.length} 个套装
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-gray-200 rounded-brick overflow-hidden">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 transition-colors ${
                activeView === 'grid'
                  ? 'bg-lego-blue text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 transition-colors ${
                activeView === 'list'
                  ? 'bg-lego-blue text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => {}}
            className="brick-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>添加套装</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="brick-card p-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主题</label>
              <select className="brick-input">
                <option value="">全部主题</option>
                {Array.from(new Set(sets.map((s) => s.theme))).map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年份范围</label>
              <div className="flex gap-2">
                <input type="number" placeholder="从" className="brick-input flex-1" />
                <input type="number" placeholder="到" className="brick-input flex-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">零件数</label>
              <select className="brick-input">
                <option value="">全部</option>
                <option value="0-500">少于 500</option>
                <option value="500-1000">500 - 1,000</option>
                <option value="1000-2000">1,000 - 2,000</option>
                <option value="2000+">超过 2,000</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">储存位置</label>
              <input
                type="text"
                placeholder="搜索位置..."
                className="brick-input"
              />
            </div>
          </div>
        </div>
      )}

      {activeView === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSets.map((set, index) => (
            <div
              key={set.id}
              className="brick-card overflow-hidden cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/collection/${set.id}`)}
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                {set.cover_image_url ? (
                  <img
                    src={set.cover_image_url}
                    alt={set.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lego-blue/10 to-lego-red/10">
                    <span className="text-6xl">🧱</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={set.status} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-lego-dark line-clamp-2">
                    {truncateString(set.name, 40)}
                  </h3>
                </div>
                <p className="text-sm text-lego-blue font-medium mb-2">
                  {set.set_num}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {set.theme}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {set.year}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-lego-dark">
                    {set.num_parts.toLocaleString()} 零件
                  </span>
                  {set.purchase_price && (
                    <span className="text-sm text-gray-600">
                      {formatCurrency(set.purchase_price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="brick-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  套装
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  主题
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年份
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  零件数
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  位置
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价值
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSets.map((set) => (
                <tr
                  key={set.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/collection/${set.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-brick bg-gray-100 overflow-hidden flex-shrink-0">
                        {set.cover_image_url ? (
                          <img
                            src={set.cover_image_url}
                            alt={set.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🧱</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-lego-dark">{set.name}</p>
                        <p className="text-xs text-gray-500">{set.set_num}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{set.theme}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{set.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {set.num_parts.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={set.status} />
                  </td>
                  <td className="px-4 py-3">
                    {set.storage_location ? (
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        {set.storage_location}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {set.purchase_price ? formatCurrency(set.purchase_price) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredSets.length === 0 && (
        <div className="brick-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-brick flex items-center justify-center">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-lego-dark mb-2">没有找到套装</h3>
          <p className="text-gray-500 mb-4">尝试调整筛选条件或搜索关键词</p>
          <button className="brick-btn-outline">清除筛选</button>
        </div>
      )}
    </div>
  );
}
