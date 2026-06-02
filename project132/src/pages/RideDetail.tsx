import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { formatDate, formatDistance, formatDuration } from '../utils/formatters';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Cloud, 
  Users, 
  MapPin,
  TrendingUp,
  Image,
  Map
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function RideDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rides } = useAppStore();
  
  const ride = rides.find(r => r.id === id);

  if (!ride) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-white">骑行记录不存在</h2>
        <Link to="/rides" className="btn-primary inline-flex items-center gap-2 mt-4">
          返回列表
        </Link>
      </div>
    );
  }

  // Sample coordinates for demo
  const sampleRoute = [
    [39.9042, 116.4074],
    [39.9242, 116.4274],
    [39.9442, 116.4074],
    [39.9642, 116.4474],
    [39.9842, 116.4274],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rides')}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">{ride.routeName}</h1>
          <p className="text-dark-300 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(ride.date)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatDistance(ride.distance)}</p>
              <p className="text-sm text-dark-400">总里程</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatDuration(ride.duration)}</p>
              <p className="text-sm text-dark-400">骑行时长</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{ride.weather || '-'}</p>
              <p className="text-sm text-dark-400">天气</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white truncate">{ride.ridingBuddies || '-'}</p>
              <p className="text-sm text-dark-400">同行车友</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-brand-400" />
            骑行轨迹
          </h2>
          <div className="h-80 rounded-lg overflow-hidden">
            <MapContainer
              center={[39.9042, 116.4074]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Polyline
                positions={sampleRoute as [number, number][]}
                color="#ff6b35"
                weight={4}
                opacity={0.8}
              />
              <Marker position={sampleRoute[0] as [number, number]}>
                <Popup>起点</Popup>
              </Marker>
              <Marker position={sampleRoute[sampleRoute.length - 1] as [number, number]}>
                <Popup>终点</Popup>
              </Marker>
            </MapContainer>
          </div>
          {!ride.gpxData && (
            <p className="text-dark-400 text-sm mt-3 text-center">
              示例轨迹 - 上传GPX文件可显示真实轨迹
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">路况体验</h2>
            <p className="text-dark-200">{ride.roadCondition || '暂无描述'}</p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">骑行心得</h2>
            <p className="text-dark-200">{ride.notes || '暂无记录'}</p>
          </div>
        </div>
      </div>

      {ride.photos.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-brand-400" />
            骑行照片 ({ride.photos.length})
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {ride.photos.map((photo, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg">
                <img
                  src={photo}
                  alt={`骑行照片 ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {ride.photos.length === 0 && (
        <div className="card p-8 text-center">
          <Image className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">暂无骑行照片</p>
          <p className="text-dark-500 text-sm mt-1">上传照片记录美好时刻</p>
        </div>
      )}
    </div>
  );
}
