import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { formatDate, formatDistance, formatDuration } from '../utils/formatters';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Plus, 
  Search,
  Filter,
  ChevronRight,
  Image,
  Map,
  Cloud,
  Users,
  Trash2,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Rides() {
  const navigate = useNavigate();
  const { rides, deleteRide } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredRides = rides.filter(ride =>
    ride.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteRide(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">骑行记录</h1>
          <p className="text-dark-300 mt-1">记录每一次精彩旅程</p>
        </div>
        <button 
          onClick={() => navigate('/rides/new')}
          className="btn-primary flex items-center gap-2 z-10 relative"
        >
          <Plus className="w-4 h-4" />
          添加记录
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="搜索骑行记录..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rides.length}</p>
              <p className="text-sm text-dark-400">总记录数</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatDistance(rides.reduce((sum, r) => sum + r.distance, 0))}</p>
              <p className="text-sm text-dark-400">总里程</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatDuration(rides.reduce((sum, r) => sum + r.duration, 0))}</p>
              <p className="text-sm text-dark-400">总时长</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rides.reduce((sum, r) => sum + r.photos.length, 0)}</p>
              <p className="text-sm text-dark-400">照片数量</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRides.length === 0 ? (
          <div className="card p-12 text-center">
            <MapPin className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">暂无骑行记录</p>
            <p className="text-dark-500 text-sm mt-2">开始记录你的第一次骑行吧！</p>
            <button 
              onClick={() => navigate('/rides/new')}
              className="btn-primary inline-flex items-center gap-2 mt-6 z-10 relative"
            >
              <Plus className="w-4 h-4" />
              添加第一条记录
            </button>
          </div>
        ) : (
          filteredRides.map((ride, index) => (
            <div
              key={ride.id}
              className="card card-hover p-6"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{ride.routeName}</h3>
                      <div className="flex items-center gap-4 text-sm text-dark-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(ride.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Cloud className="w-4 h-4" />
                          {ride.weather}
                        </span>
                        {ride.ridingBuddies && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {ride.ridingBuddies}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-dark-400 text-xs mb-1">里程</p>
                      <p className="text-white font-mono font-bold">{formatDistance(ride.distance)}</p>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-dark-400 text-xs mb-1">时长</p>
                      <p className="text-white font-mono font-bold">{formatDuration(ride.duration)}</p>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-dark-400 text-xs mb-1">路况</p>
                      <p className="text-white truncate">{ride.roadCondition || '-'}</p>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-dark-400 text-xs mb-1">照片</p>
                      <p className="text-white font-mono font-bold">{ride.photos.length} 张</p>
                    </div>
                  </div>

                  {ride.notes && (
                    <p className="text-dark-300 text-sm">{ride.notes}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <Link
                    to={`/rides/${ride.id}`}
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <button
                    className="p-2 text-dark-400 hover:text-brand-400 hover:bg-dark-700 rounded-lg transition-colors"
                    onClick={() => {}}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                    onClick={() => setShowDeleteConfirm(ride.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {ride.gpxData && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Map className="w-4 h-4 text-brand-400" />
                  <span className="text-brand-400">已关联GPX轨迹</span>
                </div>
              )}

              {showDeleteConfirm === ride.id && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 mb-3">确定要删除这条骑行记录吗？此操作不可恢复。</p>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      onClick={() => handleDelete(ride.id)}
                    >
                      确认删除
                    </button>
                    <button
                      className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
