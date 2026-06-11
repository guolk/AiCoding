import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { Search, Plus, Filter, TreePine, MapPin, Calendar } from 'lucide-react';
import { HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS } from '@/types';
import type { Tree } from '@/types';

export default function ArchiveList() {
  const { trees } = useTreeStore();
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterHealth, setFilterHealth] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const speciesList = [...new Set(trees.map((t) => t.species))];

  const filtered = trees.filter((t) => {
    const matchSearch = !search || t.species.includes(search) || t.location.includes(search) || t.scientificName.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = !filterSpecies || t.species === filterSpecies;
    const matchHealth = !filterHealth || t.healthStatus === filterHealth;
    return matchSearch && matchSpecies && matchHealth;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-600">古树档案</h1>
          <p className="text-brown-700/70 mt-1">共 {filtered.length} 条古树名木记录</p>
        </div>
        <Link
          to="/archives/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          新增档案
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-700/40" />
            <input
              type="text"
              placeholder="搜索树种、学名、地点..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-forest-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              showFilters ? 'bg-forest-50 border-forest-300 text-forest-700' : 'border-forest-200 text-brown-700/70 hover:bg-forest-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-forest-100">
            <div>
              <label className="text-xs text-brown-700/60 mb-1 block">树种</label>
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                <option value="">全部</option>
                {speciesList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-brown-700/60 mb-1 block">健康状态</label>
              <select
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                className="px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                <option value="">全部</option>
                <option value="excellent">优</option>
                <option value="good">良</option>
                <option value="fair">中</option>
                <option value="poor">差</option>
                <option value="critical">危</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filtered.map((tree: Tree) => (
          <Link
            key={tree.id}
            to={`/archives/${tree.id}`}
            className="bg-white rounded-xl shadow-sm border border-forest-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={tree.coverImage}
                alt={tree.species}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-forest-500" />
                  <h3 className="font-serif text-lg font-semibold text-brown-700">{tree.species}</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${HEALTH_STATUS_COLORS[tree.healthStatus]}`}>
                  {HEALTH_STATUS_LABELS[tree.healthStatus]}
                </span>
              </div>
              <p className="text-sm text-brown-700/50 italic mb-3">{tree.scientificName}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-brown-700/70">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>推测树龄 <strong className="text-forest-600">{tree.estimatedAge}</strong> 年</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-brown-700/70">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="truncate">{tree.location}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
