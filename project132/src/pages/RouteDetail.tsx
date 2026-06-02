import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { formatDistance, getDifficultyLabel, getDifficultyColor } from '../utils/formatters';
import { 
  ArrowLeft, 
  Calendar, 
  Fuel, 
  Star,
  Download,
  Share2,
  Map as MapIcon,
  Zap,
  Check
} from 'lucide-react';
import type { RouteItem } from '../types';

export default function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { routes } = useAppStore();
  
  const route = routes.find(r => r.id === id);

  if (!route) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-white">路线不存在</h2>
        <Link to="/routes" className="btn-primary inline-flex items-center gap-2 mt-4">
          返回列表
        </Link>
      </div>
    );
  }

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/routes')}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white">{route.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(route.difficulty)}`}>
                {getDifficultyLabel(route.difficulty)}
              </span>
              <span className="text-dark-400 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {formatDistance(route.distance)}
              </span>
              <span className="text-dark-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                最佳季节：{route.bestSeason}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportRoute(route)}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出路线
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            分享
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-brand-400" />
              路线地图
            </h2>
            <div className="h-80 bg-dark-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="w-16 h-16 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">地图预览区域</p>
                <p className="text-dark-500 text-sm mt-1">可关联GPX文件显示完整路线</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">推荐理由</h2>
            <p className="text-dark-200">{route.recommendation}</p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">精彩看点</h2>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-brand-400" />
              </div>
              <p className="text-dark-200">{route.highlights}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-brand-400" />
              加油站位置
            </h2>
            <div className="space-y-3">
              {route.gasStations.map((station, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-dark-900/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Fuel className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{station.name}</p>
                    <p className="text-dark-400 text-sm">{station.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">路线信息</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-dark-400">总里程</span>
                <span className="text-white font-mono">{formatDistance(route.distance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">难度等级</span>
                <span className={`px-2 py-0.5 rounded text-sm ${getDifficultyColor(route.difficulty)}`}>
                  {getDifficultyLabel(route.difficulty)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">最佳季节</span>
                <span className="text-white">{route.bestSeason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">社区共享</span>
                <span className="flex items-center gap-1 text-green-400">
                  <Check className="w-4 h-4" />
                  {route.isShared ? '已共享' : '未共享'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
