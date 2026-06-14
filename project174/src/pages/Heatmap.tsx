import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Mic,
  Tags,
  TrendingUp,
  Calendar,
  Clock,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  ChevronDown,
  ChevronUp,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { MapView, MapLegend, MapStats } from '@/components/map/MapView';
import { useRecordingStore } from '@/store/useRecordingStore';
import { generateHeatmapData } from '@/data/recordings';
import { getSeasonFromDate, getTimeOfDayFromDate } from '@/utils/date';
import { SEASONS, TIMES_OF_DAY, TAG_CATEGORIES, Season, TimeOfDay, TagCategory, HeatmapPoint } from '@/types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HeatmapPointWithLocation extends HeatmapPoint {
  locationName: string;
  recordings: string[];
}

const Heatmap: React.FC = () => {
  const navigate = useNavigate();
  const { recordings, tags } = useRecordingStore();

  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TagCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapPointWithLocation | null>(null);

  const filteredRecordings = useMemo(() => {
    return recordings.filter((r) => {
      if (selectedSeason !== 'all') {
        const season = getSeasonFromDate(r.recordTime);
        if (season !== selectedSeason) return false;
      }
      if (selectedTimeOfDay !== 'all') {
        const timeOfDay = getTimeOfDayFromDate(r.recordTime);
        if (timeOfDay !== selectedTimeOfDay) return false;
      }
      if (selectedCategory !== 'all') {
        const hasCategory = r.tags.some((t) => t.category === selectedCategory);
        if (!hasCategory) return false;
      }
      return true;
    });
  }, [recordings, selectedSeason, selectedTimeOfDay, selectedCategory]);

  const heatmapPoints = useMemo(() => {
    return generateHeatmapData(filteredRecordings);
  }, [filteredRecordings]);

  const heatmapPointsWithLocation = useMemo((): HeatmapPointWithLocation[] => {
    const locationMap = new Map<
      string,
      { lat: number; lng: number; count: number; tags: Set<string>; locationName: string; recordings: string[] }
    >();

    filteredRecordings.forEach((r) => {
      if (r.gpsLocation) {
        const key = `${Math.round(r.gpsLocation.latitude * 100) / 100},${Math.round(r.gpsLocation.longitude * 100) / 100}`;
        const existing = locationMap.get(key) || {
          lat: r.gpsLocation.latitude,
          lng: r.gpsLocation.longitude,
          count: 0,
          tags: new Set(),
          locationName: r.locationName,
          recordings: [],
        };
        existing.count++;
        r.tags.forEach((t) => existing.tags.add(t.id));
        existing.recordings.push(r.id);
        locationMap.set(key, existing);
      }
    });

    return Array.from(locationMap.values()).map((v) => ({
      lat: v.lat,
      lng: v.lng,
      intensity: Math.min(v.count * 20 + v.tags.size * 10, 100),
      recordingCount: v.count,
      speciesCount: v.tags.size,
      locationName: v.locationName,
      recordings: v.recordings,
    }));
  }, [filteredRecordings]);

  const stats = useMemo(() => {
    const uniqueLocations = new Set(
      filteredRecordings
        .filter((r) => r.gpsLocation)
        .map((r) => `${r.gpsLocation!.latitude.toFixed(2)},${r.gpsLocation!.longitude.toFixed(2)}`)
    ).size;
    const totalTags = new Set(filteredRecordings.flatMap((r) => r.tags.map((t) => t.id))).size;
    const avgIntensity =
      heatmapPoints.length > 0
        ? (heatmapPoints.reduce((sum, p) => sum + p.intensity, 0) / heatmapPoints.length).toFixed(1)
        : '0';

    return {
      totalRecordings: filteredRecordings.length,
      uniqueLocations,
      totalTags,
      heatmapPoints: heatmapPoints.length,
      avgIntensity,
    };
  }, [filteredRecordings, heatmapPoints]);

  const topLocations = useMemo(() => {
    return [...heatmapPointsWithLocation]
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 10);
  }, [heatmapPointsWithLocation]);

  const categoryStats = useMemo(() => {
    const categoryCount: Record<TagCategory, number> = {
      birdsong: 0,
      water: 0,
      wind: 0,
      insects: 0,
      urban: 0,
      other: 0,
    };
    filteredRecordings.forEach((r) => {
      r.tags.forEach((t) => {
        categoryCount[t.category]++;
      });
    });
    return categoryCount;
  }, [filteredRecordings]);

  const seasonHeatmapData = useMemo(() => {
    const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    return seasons.map((season) => {
      const seasonRecordings = recordings.filter((r) => getSeasonFromDate(r.recordTime) === season);
      const points = generateHeatmapData(seasonRecordings);
      const totalIntensity = points.reduce((sum, p) => sum + p.intensity, 0);
      return {
        season,
        totalIntensity,
        avgIntensity: points.length > 0 ? totalIntensity / points.length : 0,
        pointCount: points.length,
        recordingCount: seasonRecordings.length,
      };
    });
  }, [recordings]);

  const barChartData = {
    labels: seasonHeatmapData.map((d) => SEASONS[d.season].label),
    datasets: [
      {
        label: '平均热力强度',
        data: seasonHeatmapData.map((d) => d.avgIntensity.toFixed(1)),
        backgroundColor: seasonHeatmapData.map((d) => SEASONS[d.season].color + '80'),
        borderColor: seasonHeatmapData.map((d) => SEASONS[d.season].color),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categoryStats).map((k) => TAG_CATEGORIES[k as TagCategory].label),
    datasets: [
      {
        label: '声音数量',
        data: Object.values(categoryStats),
        backgroundColor: Object.keys(categoryStats).map((k) => TAG_CATEGORIES[k as TagCategory].color + '80'),
        borderColor: Object.keys(categoryStats).map((k) => TAG_CATEGORIES[k as TagCategory].color),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
  };

  const handlePointClick = (point: HeatmapPointWithLocation) => {
    navigate(`/archive?location=${encodeURIComponent(point.locationName)}`);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity < 30) return 'from-green-400 to-green-500';
    if (intensity < 50) return 'from-yellow-400 to-yellow-500';
    if (intensity < 70) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getIntensityBgColor = (intensity: number) => {
    if (intensity < 30) return 'bg-green-100 dark:bg-green-900/30';
    if (intensity < 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (intensity < 70) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-earth-900 dark:text-earth-100 font-display">
              声音丰富度热力图
            </h1>
            <p className="text-earth-600 dark:text-earth-400 mt-2">
              探索不同地点的声音多样性，发现自然声景的丰富程度
            </p>
          </div>
          <Button
            variant="secondary"
            leftIcon={showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '收起筛选' : '展开筛选'}
          </Button>
        </div>

        {showFilters && (
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter size={20} className="text-forest-500" />
                筛选条件
              </CardTitle>
              <CardDescription>按季节、时段和标签类别筛选热力图数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-2 block">
                    <Calendar size={14} className="inline mr-1" />
                    季节
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedSeason === 'all' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedSeason('all')}
                    >
                      全部
                    </Button>
                    {Object.entries(SEASONS).map(([key, value]) => (
                      <Button
                        key={key}
                        variant={selectedSeason === key ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setSelectedSeason(key as Season)}
                      >
                        {value.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-2 block">
                    <Clock size={14} className="inline mr-1" />
                    时段
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedTimeOfDay === 'all' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedTimeOfDay('all')}
                    >
                      全部
                    </Button>
                    {Object.entries(TIMES_OF_DAY).map(([key, value]) => (
                      <Button
                        key={key}
                        variant={selectedTimeOfDay === key ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setSelectedTimeOfDay(key as TimeOfDay)}
                      >
                        {value.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-2 block">
                    <Tags size={14} className="inline mr-1" />
                    标签类别
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                    >
                      全部
                    </Button>
                    {Object.entries(TAG_CATEGORIES).map(([key, value]) => (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setSelectedCategory(key as TagCategory)}
                      >
                        {value.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="热力点数"
            value={stats.heatmapPoints}
            icon={<Layers size={24} />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="录音数量"
            value={stats.totalRecordings}
            icon={<Mic size={24} />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="声音种类"
            value={stats.totalTags}
            icon={<Tags size={24} />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="平均热力强度"
            value={stats.avgIntensity}
            icon={<TrendingUp size={24} />}
            trend={{ value: 12, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card glass className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={20} className="text-forest-500" />
                  声音丰富度热力图
                </CardTitle>
                <CardDescription>颜色从绿色（低丰富度）到红色（高丰富度）渐变</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" title="放大">
                  <ZoomIn size={18} />
                </Button>
                <Button variant="ghost" size="icon" title="缩小">
                  <ZoomOut size={18} />
                </Button>
                <Button variant="ghost" size="icon" title="平移">
                  <Move size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="relative" style={{ height: '500px' }}>
                <MapView
                  recordings={filteredRecordings}
                  heatmapPoints={heatmapPoints}
                  showHeatmap={true}
                  showMarkers={false}
                  height="500px"
                />
                <MapLegend />
                <MapStats recordings={filteredRecordings} />

                {hoveredPoint && (
                  <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-forest-900/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                    <h4 className="font-semibold text-earth-900 dark:text-earth-100 mb-2">
                      {hoveredPoint.locationName}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-earth-500 dark:text-earth-400">热力强度</span>
                        <span className="font-medium">{hoveredPoint.intensity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-earth-500 dark:text-earth-400">录音数量</span>
                        <span className="font-medium">{hoveredPoint.recordingCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-earth-500 dark:text-earth-400">声音种类</span>
                        <span className="font-medium">{hoveredPoint.speciesCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-sunset-500" />
                热力强度排名
              </CardTitle>
              <CardDescription>声音丰富度最高的地点</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {topLocations.map((point, index) => (
                <div
                  key={`${point.lat}-${point.lng}`}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${getIntensityBgColor(point.intensity)}`}
                  onClick={() => handlePointClick(point)}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${getIntensityColor(point.intensity)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-earth-900 dark:text-earth-100 truncate">
                        {point.locationName}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-earth-500 dark:text-earth-400">
                        <span className="flex items-center gap-1">
                          <Mic size={12} />
                          {point.recordingCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tags size={12} />
                          {point.speciesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} />
                          {point.intensity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {topLocations.length === 0 && (
                <div className="text-center py-8 text-earth-500 dark:text-earth-400">
                  暂无符合条件的数据
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-sky-500" />
                不同季节热力对比
              </CardTitle>
              <CardDescription>各季节的平均声音丰富度对比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags size={20} className="text-forest-500" />
                各类别声音分布
              </CardTitle>
              <CardDescription>不同类别的声音数量统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={categoryChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 size={20} className="text-sunset-500" />
              最丰富的地点 TOP 10
            </CardTitle>
            <CardDescription>点击查看该地点的所有录音</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-earth-200 dark:border-forest-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-earth-700 dark:text-earth-300">
                      排名
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-earth-700 dark:text-earth-300">
                      地点
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-earth-700 dark:text-earth-300">
                      热力强度
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-earth-700 dark:text-earth-300">
                      录音数量
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-earth-700 dark:text-earth-300">
                      声音种类
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-earth-700 dark:text-earth-300">
                      主要标签
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-earth-700 dark:text-earth-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topLocations.map((point, index) => {
                    const pointRecordings = filteredRecordings.filter((r) =>
                      point.recordings.includes(r.id)
                    );
                    const pointTags = new Set(pointRecordings.flatMap((r) => r.tags.map((t) => t.id)));
                    const topTags = tags
                      .filter((t) => pointTags.has(t.id))
                      .slice(0, 3);

                    return (
                      <tr
                        key={`${point.lat}-${point.lng}`}
                        className="border-b border-earth-100 dark:border-forest-800/50 hover:bg-earth-50 dark:hover:bg-forest-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${getIntensityColor(point.intensity)} text-white font-bold text-sm`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-earth-900 dark:text-earth-100">
                          {point.locationName}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getIntensityBgColor(point.intensity)} text-earth-800 dark:text-earth-200`}
                          >
                            {point.intensity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-earth-700 dark:text-earth-300">
                          {point.recordingCount}
                        </td>
                        <td className="py-3 px-4 text-center text-earth-700 dark:text-earth-300">
                          {point.speciesCount}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            {topTags.map((tag) => (
                              <Tag key={tag.id} tag={tag} size="sm" />
                            ))}
                            {pointTags.size > 3 && (
                              <span className="text-xs text-earth-500 dark:text-earth-400">
                                +{pointTags.size - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePointClick(point)}
                          >
                            查看录音
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {topLocations.length === 0 && (
                <div className="text-center py-8 text-earth-500 dark:text-earth-400">
                  暂无符合条件的数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Heatmap;
