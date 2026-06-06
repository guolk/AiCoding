import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Navigation, Cloud, Sun, CloudRain, Wind, Edit, Eye } from 'lucide-react';
import { formatDateTime, formatDistance, formatDuration, getWindDirectionArrow } from '../../../utils';
import type { Voyage } from '../../../types';

const getWeatherIcon = (conditions: string) => {
  if (conditions.includes('晴') || conditions.includes('晴朗')) return <Sun className="w-5 h-5 text-yellow-500" />;
  if (conditions.includes('雨') || conditions.includes('阵雨')) return <CloudRain className="w-5 h-5 text-blue-500" />;
  if (conditions.includes('云') || conditions.includes('多云')) return <Cloud className="w-5 h-5 text-gray-500" />;
  if (conditions.includes('风') || conditions.includes('浪')) return <Wind className="w-5 h-5 text-ocean-500" />;
  return <Cloud className="w-5 h-5 text-gray-400" />;
};

interface VoyageCardProps {
  voyage: Voyage;
  boatName: string;
}

export default function VoyageCard({ voyage, boatName }: VoyageCardProps) {
  const navigate = useNavigate();

  return (
    <div className="card p-6 hover:border-ocean-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-xl flex items-center justify-center text-white">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-ocean-800">{voyage.destination}</h3>
            <p className="text-sm text-gray-500">{boatName}</p>
          </div>
        </div>
        {getWeatherIcon(voyage.weatherConditions)}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-ocean-500" />
          <span>{formatDateTime(voyage.departureTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-nautical-500" />
          <span>{voyage.startPoint} → {voyage.destination}</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Navigation className="w-4 h-4 text-ocean-500" />
            <span>{formatDistance(voyage.distance)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-ocean-500" />
            <span>{formatDuration(voyage.duration)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span className="text-lg">{getWindDirectionArrow(voyage.windDirection)}</span>
            <span>{voyage.windSpeed}节</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/voyages/${voyage.id}`)}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          查看详情
        </button>
        <button
          onClick={() => navigate(`/voyages/${voyage.id}/edit`)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          编辑
        </button>
      </div>
    </div>
  );
}
