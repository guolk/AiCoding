import { useState } from 'react';
import { useAppStore } from '../store';
import { formatDistance, getDifficultyLabel, getDifficultyColor } from '../utils/formatters';
import { 
  Map, 
  Star, 
  Plus, 
  Search, 
  Filter,
  Fuel,
  Calendar as CalendarIcon,
  Share2,
  Download,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RouteItem } from '../types';

export default function Routes() {
  const { routes } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.highlights.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || route.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const exportRoute = (route: RouteItem) => {
    const data = JSON.stringify(route, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${route.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">路线库</h1>
          <p className="text-dark-300 mt-1">发现和管理精彩骑行路线</p>
        </div>
        <Link to="/routes/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加路线
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="搜索路线..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="input-field w-40"
        >
          <option value="all">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
          <option value="extreme">极限</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{routes.length}</p>
              <p className="text-sm text-dark-400">收藏路线</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{routes.filter(r => r.isShared).length}</p>
              <p className="text-sm text-dark-400">已共享</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatDistance(routes.reduce((sum, r) => sum + r.distance, 0))}</p>
              <p className="text-sm text-dark-400">总里程</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredRoutes.length === 0 ? (
          <div className="col-span-2 card p-12 text-center">
            <Map className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">暂无收藏路线</p>
            <p className="text-dark-500 text-sm mt-2">开始添加你喜欢的骑行路线吧！</p>
            <Link to="/routes/new" className="btn-primary inline-flex items-center gap-2 mt-6">
              <Plus className="w-4 h-4" />
              添加第一条路线
            </Link>
          </div>
        ) : (
          filteredRoutes.map((route, index) => (
            <div
              key={route.id}
              className="card card-hover overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-40 bg-gradient-to-br from-dark-700 to-dark-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Map className="w-16 h-16 text-dark-600" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(route.difficulty)}`}>
                    {getDifficultyLabel(route.difficulty)}
                  </span>
                </div>
                {route.isShared && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      已共享
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{route.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-dark-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {formatDistance(route.distance)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {route.bestSeason}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => exportRoute(route)}
                      className="p-2 text-dark-400 hover:text-brand-400 hover:bg-dark-700 rounded-lg transition-colors"
                      title="导出路线"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-dark-400 mb-1">精彩看点</p>
                  <p className="text-dark-200">{route.highlights}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-dark-400 mb-2 flex items-center gap-1">
                    <Fuel className="w-4 h-4" />
                    加油站位置
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {route.gasStations.slice(0, 2).map((station, i) => (
                      <span key={i} className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-200">
                        {station.name}
                      </span>
                    ))}
                    {route.gasStations.length > 2 && (
                      <span className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-400">
                        +{route.gasStations.length - 2} 更多
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <p className="text-sm text-dark-400 line-clamp-1 flex-1">
                    {route.recommendation}
                  </p>
                  <Link
                    to={`/routes/${route.id}`}
                    className="ml-4 p-2 text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
