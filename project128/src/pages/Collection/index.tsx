
import { useState } from 'react';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useJewelryStore from '../../store/jewelryStore';
import { JewelryType, OccasionType } from '../../types';
import { getJewelryTypeLabel, getOccasionLabel } from '../../utils/format';
import JewelryCard from './JewelryCard';

const Collection = () => {
  const navigate = useNavigate();
  const { jewelries, deleteJewelry } = useJewelryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOccasion, setFilterOccasion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const jewelryTypes: JewelryType[] = ['ring', 'necklace', 'earring', 'bracelet', 'brooch', 'watch', 'other'];
  const occasionTypes: OccasionType[] = ['daily', 'formal', 'wedding', 'party', 'business'];

  const filteredJewelries = jewelries.filter((jewelry) => {
    const matchesSearch = jewelry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jewelry.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jewelry.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || jewelry.type === filterType;
    const matchesOccasion = filterOccasion === 'all' || jewelry.suitableOccasions.includes(filterOccasion as OccasionType);
    return matchesSearch && matchesType && matchesOccasion;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这件珠宝吗？')) {
      deleteJewelry(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-600">藏品档案</h1>
          <p className="text-ink-400 mt-1">共 {filteredJewelries.length} 件珠宝藏品</p>
        </div>
        <button
          onClick={() => navigate('/collection/new')}
          className="flex items-center gap-2 px-6 py-3 gold-gradient text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-5 h-5" />
          新增藏品
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card border border-gold-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input
                type="text"
                placeholder="搜索珠宝名称、品牌、材质..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gold-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
            >
              <option value="all">全部类型</option>
              {jewelryTypes.map((type) => (
                <option key={type} value={type}>{getJewelryTypeLabel(type)}</option>
              ))}
            </select>

            <select
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:outline-none transition-colors bg-cream-50"
            >
              <option value="all">全部场合</option>
              {occasionTypes.map((occasion) => (
                <option key={occasion} value={occasion}>{getOccasionLabel(occasion)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 bg-cream-50 rounded-xl border border-gold-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gold-500 text-white' : 'text-ink-400 hover:text-gold-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gold-500 text-white' : 'text-ink-400 hover:text-gold-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {filteredJewelries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-card border border-gold-100 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center">
            <Search className="w-10 h-10 text-gold-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink-600 mb-2">未找到匹配的珠宝</h3>
          <p className="text-ink-400">尝试调整搜索条件或筛选器</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {filteredJewelries.map((jewelry) => (
            <JewelryCard key={jewelry.id} jewelry={jewelry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Collection;
