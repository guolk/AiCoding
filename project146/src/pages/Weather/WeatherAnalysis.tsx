import { useState, useMemo } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Waves,
  Droplets,
  MapPin,
  Calendar,
  Star,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AppLayout from '@/components/Layout/AppLayout';
import { useAppStore } from '@/store';
import { formatDate, getWindDirectionText, getWindDirectionArrow } from '@/utils';
import type { Voyage, ForecastDay } from '@/types';

const getWeatherIcon = (windSpeed: number, precipitation: number) => {
  if (precipitation > 30) return <CloudRain className="w-8 h-8 text-blue-500" />;
  if (precipitation > 10) return <Cloud className="w-8 h-8 text-gray-500" />;
  if (windSpeed > 25) return <Wind className="w-8 h-8 text-nautical-500" />;
  return <Sun className="w-8 h-8 text-yellow-500" />;
};

const getErrorLevel = (forecast: number, actual: number) => {
  const error = Math.abs(forecast - actual);
  if (error <= 3) return 'low';
  if (error <= 8) return 'medium';
  return 'high';
};

const getErrorColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function WeatherAnalysisContent() {
  const weatherForecast = useAppStore((state) => state.weatherForecast);
  const seasonalWeather = useAppStore((state) => state.seasonalWeather);
  const voyages = useAppStore((state) => state.voyages);
  const [selectedRegion, setSelectedRegion] = useState('渤海湾');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const regions = ['渤海湾', '南海'];

  const filteredSeasonalData = useMemo(() => {
    return seasonalWeather.filter((item) => item.region === selectedRegion);
  }, [seasonalWeather, selectedRegion]);

  const chartData = useMemo(() => {
    return filteredSeasonalData.map((item) => ({
      month: monthNames[item.month - 1],
      avgWindSpeed: item.avgWindSpeed,
      avgWaveHeight: item.avgWaveHeight,
    }));
  }, [filteredSeasonalData]);

  const comparisonData = useMemo(() => {
    const recentVoyages = voyages
      .filter((v) => v.weatherRecord)
      .sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
      .slice(0, 5);

    return recentVoyages.map((voyage) => ({
      id: voyage.id,
      date: formatDate(voyage.departureTime, 'MM-dd'),
      destination: voyage.destination,
      forecastWind: voyage.windSpeed,
      actualWind: voyage.weatherRecord?.actualWindSpeed || 0,
      forecastWave: voyage.windSpeed * 0.08,
      actualWave: voyage.weatherRecord?.actualWaveHeight || 0,
      windError: getErrorLevel(voyage.windSpeed, voyage.weatherRecord?.actualWindSpeed || 0),
      waveError: getErrorLevel(
        voyage.windSpeed * 0.08,
        voyage.weatherRecord?.actualWaveHeight || 0
      ),
    }));
  }, [voyages]);

  const barChartData = comparisonData.map((item) => ({
    date: item.date,
    预报风速: item.forecastWind,
    实际风速: item.actualWind,
  }));

  const bestSeasonMonth = useMemo(() => {
    const maxRating = Math.max(...filteredSeasonalData.map((item) => item.rating));
    return filteredSeasonalData
      .filter((item) => item.rating === maxRating)
      .map((item) => item.month);
  }, [filteredSeasonalData]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-ocean-800">气象分析</h1>
        <div className="flex items-center gap-2 text-sm text-ocean-600">
          <Calendar className="w-4 h-4" />
          <span>预报发布时间：{formatDate(weatherForecast.forecastDate, 'yyyy年MM月dd日 HH:mm')}</span>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-ocean-700">7天天气预报</h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-ocean-50 rounded-lg">
            <MapPin className="w-4 h-4 text-ocean-600" />
            <span className="text-ocean-700 font-medium">{weatherForecast.location}</span>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {weatherForecast.days.map((day: ForecastDay, index: number) => (
            <div
              key={day.id}
              className={`flex-shrink-0 w-40 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md hover:scale-105 ${
                index === 0
                  ? 'border-ocean-500 bg-ocean-50'
                  : 'border-gray-100 bg-gray-50 hover:border-ocean-300'
              }`}
            >
              <div className="text-center mb-3">
                <p className="text-sm font-medium text-ocean-700">
                  {formatDate(day.date, 'MM月dd日')}
                </p>
                <p className="text-xs text-gray-500">
                  {index === 0 ? '今天' : `第${index + 1}天`}
                </p>
              </div>

              <div className="flex justify-center mb-3">
                {getWeatherIcon(day.windSpeed, day.precipitation)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    风速
                  </span>
                  <span className="font-medium text-ocean-700">{day.windSpeed} 节</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    风向
                  </span>
                  <span className="font-medium text-ocean-700">
                    <span className="text-lg mr-1">{getWindDirectionArrow(day.windDirection)}</span>
                    {getWindDirectionText(day.windDirection)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Waves className="w-3 h-3" />
                    浪高
                  </span>
                  <span className="font-medium text-ocean-700">{day.waveHeight} 米</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Waves className="w-3 h-3" />
                    潮汐
                  </span>
                  <span className="font-medium text-ocean-700">{day.tide} 米</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    降水
                  </span>
                  <span
                    className={`font-medium ${
                      day.precipitation > 30
                        ? 'text-blue-600'
                        : day.precipitation > 10
                        ? 'text-gray-600'
                        : 'text-green-600'
                    }`}
                  >
                    {day.precipitation}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-display font-semibold text-ocean-700 mb-6">
          历史气象预报与实际对比
        </h2>

        <div className="h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                label={{
                  value: '风速 (节)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#64748b', fontSize: 12 },
                }}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="预报风速" fill="#0B3D91" radius={[4, 4, 0, 0]} />
              <Bar dataKey="实际风速" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ocean-50">
                <th className="px-4 py-3 text-left font-medium text-ocean-700 rounded-l-lg">
                  航行日期
                </th>
                <th className="px-4 py-3 text-left font-medium text-ocean-700">目的地</th>
                <th className="px-4 py-3 text-center font-medium text-ocean-700">预报风速</th>
                <th className="px-4 py-3 text-center font-medium text-ocean-700">实际风速</th>
                <th className="px-4 py-3 text-center font-medium text-ocean-700">预报浪高</th>
                <th className="px-4 py-3 text-center font-medium text-ocean-700">实际浪高</th>
                <th className="px-4 py-3 text-center font-medium text-ocean-700 rounded-r-lg">
                  误差分析
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-ocean-800">{item.date}</td>
                  <td className="px-4 py-3 text-ocean-800">{item.destination}</td>
                  <td className="px-4 py-3 text-center text-ocean-700 font-medium">
                    {item.forecastWind} 节
                  </td>
                  <td className="px-4 py-3 text-center text-nautical-600 font-medium">
                    {item.actualWind} 节
                  </td>
                  <td className="px-4 py-3 text-center text-ocean-700">
                    {item.forecastWave.toFixed(1)} 米
                  </td>
                  <td className="px-4 py-3 text-center text-nautical-600">
                    {item.actualWave.toFixed(1)} 米
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorColor(
                          item.windError
                        )}`}
                      >
                        风速{' '}
                        {item.windError === 'low'
                          ? '优'
                          : item.windError === 'medium'
                          ? '中'
                          : '差'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorColor(
                          item.waveError
                        )}`}
                      >
                        浪高{' '}
                        {item.waveError === 'low'
                          ? '优'
                          : item.waveError === 'medium'
                          ? '中'
                          : '差'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-ocean-700">季节性气象规律</h2>
          <div className="relative">
            <button
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>{selectedRegion}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showRegionDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      setShowRegionDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-ocean-50 first:rounded-t-lg last:rounded-b-lg ${
                      selectedRegion === region
                        ? 'text-ocean-700 font-medium bg-ocean-50'
                        : 'text-gray-700'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: '风速 (节)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#0B3D91', fontSize: 12 },
                  }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: '浪高 (米)',
                    angle: 90,
                    position: 'insideRight',
                    style: { fill: '#FF6B35', fontSize: 12 },
                  }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgWindSpeed"
                  name="平均风速"
                  stroke="#0B3D91"
                  strokeWidth={3}
                  dot={{ fill: '#0B3D91', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgWaveHeight"
                  name="平均浪高"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {filteredSeasonalData.map((item) => {
              const isBestSeason = bestSeasonMonth.includes(item.month);
              return (
                <div
                  key={item.month}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    isBestSeason
                      ? 'border-nautical-400 bg-nautical-50 shadow-md'
                      : 'border-gray-100 bg-gray-50 hover:border-ocean-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-semibold text-ocean-800">
                      {monthNames[item.month - 1]}
                    </span>
                    {isBestSeason && (
                      <span className="px-1.5 py-0.5 bg-nautical-500 text-white text-xs rounded-full">
                        最佳
                      </span>
                    )}
                  </div>
                  {renderStars(item.rating)}
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">风速</span>
                      <span className="font-medium text-ocean-700">{item.avgWindSpeed}节</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">风向</span>
                      <span className="font-medium text-ocean-700">{item.predominantWind}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">浪高</span>
                      <span className="font-medium text-ocean-700">{item.avgWaveHeight}米</span>
                    </div>
                    <div className="pt-1 mt-1 border-t border-gray-200">
                      <span className="text-nautical-600 font-medium">{item.bestFor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function WeatherAnalysis() {
  return <WeatherAnalysisContent />;
}
