import { Link } from 'react-router-dom';
import { ChevronRight, Home, Navigation, Calendar, MapPin, Clock, Wind, Edit, ArrowLeft } from 'lucide-react';
import { useVoyageDetail } from './hooks/useVoyageDetail';
import VoyageMap from '../../components/Map/VoyageMap';
import InfoCard from './components/InfoCard';
import EventTimeline from './components/EventTimeline';
import WeatherComparison from './components/WeatherComparison';

export default function VoyageDetail() {
  const { voyage, boat, navigate, formatValue } = useVoyageDetail();

  if (!voyage) {
    return (
      <div className="card p-12 text-center">
        <Navigation className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="font-display text-2xl font-bold text-gray-600 mb-2">航行记录不存在</h2>
        <p className="text-gray-500 mb-6">该航行记录可能已被删除或不存在</p>
        <button onClick={() => navigate('/voyages')} className="btn-primary">
          返回列表
        </button>
      </div>
    );
  }

  const formatted = formatValue(voyage);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/voyages')} className="w-10 h-10 rounded-lg border border-ocean-200 flex items-center justify-center hover:bg-ocean-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-ocean-600" />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="flex items-center gap-1 hover:text-ocean-600"><Home className="w-4 h-4" />首页</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/voyages" className="hover:text-ocean-600">航行日志</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-ocean-700 font-medium">{voyage.destination}</span>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ocean-800">{voyage.destination}</h1>
          <p className="text-gray-500 mt-1">{boat?.name || '未知船艇'} · {voyage.startPoint} → {voyage.destination}</p>
        </div>
        <button onClick={() => navigate(`/voyages/${voyage.id}/edit`)} className="btn-accent flex items-center gap-2">
          <Edit className="w-4 h-4" />
          编辑
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard icon={Calendar} label="出发时间" value={formatted.departureTime} color="ocean" />
        <InfoCard icon={Clock} label="到达时间" value={formatted.arrivalTime} color="ocean" />
        <InfoCard icon={Navigation} label="航行距离" value={formatted.distance} color="nautical" />
        <InfoCard icon={Clock} label="航行时长" value={formatted.duration} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="section-title mb-4">GPS轨迹</h2>
            <VoyageMap gpsPoints={voyage.gpsPoints} events={voyage.events} height="400px" />
          </div>
          <div className="card p-6">
            <h2 className="section-title mb-4">特殊事件</h2>
            <EventTimeline events={voyage.events || []} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="section-title mb-4">航行信息</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">起点</p>
                <p className="font-medium text-ocean-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />{voyage.startPoint}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">终点</p>
                <p className="font-medium text-ocean-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-nautical-500" />{voyage.destination}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">天气条件</p>
                <p className="font-medium text-ocean-800">{voyage.weatherConditions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">风力风向</p>
                <p className="font-medium text-ocean-800 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-ocean-500" />
                  {formatted.windDirectionArrow} {formatted.windDirectionText} {voyage.windSpeed}节
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4">天气对比</h2>
            <WeatherComparison voyage={voyage} />
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4">航行笔记</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{voyage.notes || '暂无航行笔记'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
