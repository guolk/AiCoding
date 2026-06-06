import { Cloud, Thermometer, Waves } from 'lucide-react';
import { getWindDirectionText, getWindDirectionArrow } from '../../../utils';
import type { Voyage } from '../../../types';

interface WeatherComparisonProps {
  voyage: Voyage;
}

export default function WeatherComparison({ voyage }: WeatherComparisonProps) {
  const forecastWind = voyage.windSpeed;
  const forecastDirection = voyage.windDirection;
  const actualWind = voyage.weatherRecord?.actualWindSpeed || forecastWind;
  const actualDirection = voyage.weatherRecord?.actualWindDirection || forecastDirection;
  const actualWaveHeight = voyage.weatherRecord?.actualWaveHeight || 1.0;

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-ocean-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-ocean-800">天气预报</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">风速</span>
            <span className="font-semibold text-ocean-700">{forecastWind} 节</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">风向</span>
            <span className="font-semibold text-ocean-700">
              {getWindDirectionArrow(forecastDirection)} {getWindDirectionText(forecastDirection)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-nautical-50 to-orange-50 rounded-xl p-5 border border-nautical-100">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="w-5 h-5 text-nautical-500" />
          <h4 className="font-semibold text-ocean-800">实际记录</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">风速</span>
            <span className="font-semibold text-nautical-600">{actualWind} 节</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">风向</span>
            <span className="font-semibold text-nautical-600">
              {getWindDirectionArrow(actualDirection)} {getWindDirectionText(actualDirection)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">浪高</span>
            <span className="font-semibold text-nautical-600 flex items-center gap-1">
              <Waves className="w-4 h-4" />
              {actualWaveHeight} 米
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
