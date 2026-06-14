import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  Clock,
  Tags,
  Star,
  Signal,
  Calendar,
  Mic,
  Cloud,
  Filter,
  X,
  ArrowRight,
  TrendingUp,
  Sun,
  Snowflake,
  Wind,
  Droplets,
  Leaf,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RecordingCard } from '@/components/recording/RecordingCard';
import { Tag, TagFilter, CategoryFilter } from '@/components/ui/Tag';
import { useRecordingStore } from '@/store/useRecordingStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { generateMockTimeDistribution } from '@/data/recordings';
import { getSeasonFromDate } from '@/utils/date';
import { SEASONS, TAG_CATEGORIES, WEATHER_TYPES, TagCategory, WeatherType } from '@/types';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const { recordings, tags, selectedTags, setSelectedTags } = useRecordingStore();
  const { playRecording } = usePlayerStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TagCategory | null>(null);
  const [selectedTagForAnalysis, setSelectedTagForAnalysis] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecordings = useMemo(() => {
    let filtered = [...recordings];

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((r) => new Date(r.recordTime) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.recordTime) <= end);
    }

    if (selectedCategory) {
      filtered = filtered.filter((r) =>
        r.tags.some((t) => t.category === selectedCategory)
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((r) =>
        r.tags.some((t) => selectedTags.includes(t.id))
      );
    }

    if (selectedHour !== null) {
      filtered = filtered.filter(
        (r) => new Date(r.recordTime).getHours() === selectedHour
      );
    }

    if (selectedTagForAnalysis) {
      filtered = filtered.filter((r) =>
        r.tags.some((t) => t.id === selectedTagForAnalysis)
      );
    }

    return filtered;
  }, [recordings, startDate, endDate, selectedCategory, selectedTags, selectedHour, selectedTagForAnalysis]);

  const stats = useMemo(() => {
    const totalDuration = filteredRecordings.reduce(
      (sum, r) => sum + (r.audioMetadata?.duration || 0),
      0
    );
    const avgRating =
      filteredRecordings.length > 0
        ? filteredRecordings.reduce(
            (sum, r) => sum + (r.qualityAssessment?.overallRating || 0),
            0
          ) / filteredRecordings.length
        : 0;
    const avgSNR =
      filteredRecordings.length > 0
        ? filteredRecordings.reduce(
            (sum, r) => sum + (r.qualityAssessment?.signalToNoise || 0),
            0
          ) / filteredRecordings.length
        : 0;

    return {
      totalRecordings: filteredRecordings.length,
      totalDuration,
      avgRating: avgRating.toFixed(1),
      avgSNR: avgSNR.toFixed(0),
    };
  }, [filteredRecordings]);

  const timeDistribution = useMemo(() => {
    return generateMockTimeDistribution(filteredRecordings);
  }, [filteredRecordings]);

  const tagStats = useMemo(() => {
    const tagCount: Record<string, number> = {};
    filteredRecordings.forEach((r) => {
      r.tags.forEach((t) => {
        tagCount[t.id] = (tagCount[t.id] || 0) + 1;
      });
    });
    return tags
      .map((t) => ({ ...t, count: tagCount[t.id] || 0 }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredRecordings, tags]);

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

  const seasonStats = useMemo(() => {
    const seasonCount: Record<string, number> = {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    };
    filteredRecordings.forEach((r) => {
      const season = getSeasonFromDate(r.recordTime);
      seasonCount[season]++;
    });
    return seasonCount;
  }, [filteredRecordings]);

  const qualityStats = useMemo(() => {
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const snrDistribution: Record<string, number> = {
      '<30dB': 0,
      '30-40dB': 0,
      '40-50dB': 0,
      '>50dB': 0,
    };

    filteredRecordings.forEach((r) => {
      const rating = r.qualityAssessment?.overallRating || 0;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[Math.floor(rating)]++;
      }

      const snr = r.qualityAssessment?.signalToNoise || 0;
      if (snr < 30) snrDistribution['<30dB']++;
      else if (snr < 40) snrDistribution['30-40dB']++;
      else if (snr < 50) snrDistribution['40-50dB']++;
      else snrDistribution['>50dB']++;
    });

    return { ratingDistribution, snrDistribution };
  }, [filteredRecordings]);

  const equipmentStats = useMemo(() => {
    const equipCount: Record<string, number> = {};
    filteredRecordings.forEach((r) => {
      equipCount[r.equipment] = (equipCount[r.equipment] || 0) + 1;
    });
    return Object.entries(equipCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRecordings]);

  const weatherStats = useMemo(() => {
    const weatherCount: Record<WeatherType, number> = {
      sunny: 0,
      cloudy: 0,
      rainy: 0,
      foggy: 0,
      windy: 0,
      snowy: 0,
      clear: 0,
    };
    filteredRecordings.forEach((r) => {
      weatherCount[r.weather]++;
    });
    return weatherCount;
  }, [filteredRecordings]);

  const tagTimeDistribution = useMemo(() => {
    if (!selectedTagForAnalysis) return null;

    const distribution: { hour: number; count: number }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const count = filteredRecordings.filter((r) => {
        const rHour = new Date(r.recordTime).getHours();
        return rHour === hour && r.tags.some((t) => t.id === selectedTagForAnalysis);
      }).length;
      distribution.push({ hour, count });
    }
    return distribution;
  }, [filteredRecordings, selectedTagForAnalysis]);

  const mostActiveHour = useMemo(() => {
    if (!tagTimeDistribution) return null;
    const max = Math.max(...tagTimeDistribution.map((d) => d.count));
    if (max === 0) return null;
    return tagTimeDistribution.find((d) => d.count === max);
  }, [tagTimeDistribution]);

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
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    cutout: '65%',
  };

  const timeLineChartData = {
    labels: timeDistribution.map((d) => `${d.hour.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: '录音数量',
        data: timeDistribution.map((d) => d.count),
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e',
        tension: 0.4,
        pointBackgroundColor: timeDistribution.map((d) =>
          d.hour === selectedHour ? '#f59e0b' : '#22c55e'
        ),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: timeDistribution.map((d) => (d.hour === selectedHour ? 8 : 4)),
        pointHoverRadius: 6,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categoryStats).map(
      (k) => TAG_CATEGORIES[k as TagCategory].label
    ),
    datasets: [
      {
        data: Object.values(categoryStats),
        backgroundColor: Object.keys(categoryStats).map(
          (k) => TAG_CATEGORIES[k as TagCategory].color + '80'
        ),
        borderColor: Object.keys(categoryStats).map(
          (k) => TAG_CATEGORIES[k as TagCategory].color
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const seasonChartData = {
    labels: Object.keys(seasonStats).map(
      (k) => SEASONS[k as keyof typeof SEASONS].label
    ),
    datasets: [
      {
        data: Object.values(seasonStats),
        backgroundColor: Object.keys(seasonStats).map(
          (k) => SEASONS[k as keyof typeof SEASONS].color
        ),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const ratingChartData = {
    labels: ['1星', '2星', '3星', '4星', '5星'],
    datasets: [
      {
        label: '录音数量',
        data: Object.values(qualityStats.ratingDistribution),
        backgroundColor: ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#86efac'],
        borderColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const snrChartData = {
    labels: Object.keys(qualityStats.snrDistribution),
    datasets: [
      {
        label: '录音数量',
        data: Object.values(qualityStats.snrDistribution),
        backgroundColor: ['#fee2e2', '#fef3c7', '#dcfce7', '#bbf7d0'],
        borderColor: ['#ef4444', '#eab308', '#22c55e', '#16a34a'],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const weatherChartData = {
    labels: Object.keys(weatherStats).map(
      (k) => WEATHER_TYPES[k as WeatherType].label
    ),
    datasets: [
      {
        data: Object.values(weatherStats),
        backgroundColor: [
          '#fef08a',
          '#d1d5db',
          '#93c5fd',
          '#c4b5fd',
          '#93c5fd',
          '#dbeafe',
          '#1e3a5f',
        ],
        borderWidth: 0,
      },
    ],
  };

  const tagTimeChartData = tagTimeDistribution
    ? {
        labels: tagTimeDistribution.map((d) =>
          `${d.hour.toString().padStart(2, '0')}:00`
        ),
        datasets: [
          {
            label: '录音数量',
            data: tagTimeDistribution.map((d) => d.count),
            backgroundColor: tags.find((t) => t.id === selectedTagForAnalysis)?.color + '80' || '#22c55e80',
            borderColor: tags.find((t) => t.id === selectedTagForAnalysis)?.color || '#22c55e',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      }
    : null;

  const handleTagClick = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
  };

  const handleTimeChartClick = (_event: unknown, elements: Array<{ index: number }>) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedHour(selectedHour === index ? null : index);
    }
  };

  const clearAllFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategory(null);
    setSelectedTags([]);
    setSelectedHour(null);
    setSelectedTagForAnalysis(null);
  };

  const hasActiveFilters =
    startDate ||
    endDate ||
    selectedCategory ||
    selectedTags.length > 0 ||
    selectedHour !== null ||
    selectedTagForAnalysis !== null;

  const getWeatherIcon = (weather: WeatherType) => {
    const iconMap: Record<WeatherType, React.ReactNode> = {
      sunny: <Sun size={16} />,
      cloudy: <Cloud size={16} />,
      rainy: <Droplets size={16} />,
      foggy: <Cloud size={16} />,
      windy: <Wind size={16} />,
      snowy: <Snowflake size={16} />,
      clear: <Star size={16} />,
    };
    return iconMap[weather];
  };

  const getSeasonIcon = (season: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      spring: <Leaf size={16} />,
      summer: <Sun size={16} />,
      autumn: <Leaf size={16} />,
      winter: <Snowflake size={16} />,
    };
    return iconMap[season];
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-earth-900 dark:text-earth-100 font-display">
              声音分析
            </h1>
            <p className="text-earth-600 dark:text-earth-400 mt-2">
              深入分析你的自然声音收藏，发现声音背后的规律与故事
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
            className={showFilters ? 'bg-forest-100 dark:bg-forest-900/50' : ''}
          >
            筛选条件
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-forest-600 text-white text-xs rounded-full">
                {[
                  startDate && '日期',
                  selectedCategory && '分类',
                  selectedTags.length > 0 && `${selectedTags.length}个标签`,
                  selectedHour !== null && '时段',
                  selectedTagForAnalysis && '特定声音',
                ].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">筛选条件</CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X size={14} className="mr-1" />
                    清除全部
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                  日期范围
                </h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-earth-500">开始:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-700 dark:text-earth-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-earth-500">结束:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-700 dark:text-earth-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                  声音分类
                </h4>
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={(cat) =>
                    setSelectedCategory(cat as TagCategory | null)
                  }
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                  标签筛选
                </h4>
                <TagFilter
                  tags={tags}
                  selectedTags={selectedTags}
                  onTagClick={handleTagClick}
                  category={selectedCategory || undefined}
                />
              </div>

              {selectedHour !== null && (
                <div className="flex items-center gap-2 p-3 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                  <Clock size={18} className="text-sky-600 dark:text-sky-400" />
                  <span className="text-sm text-sky-700 dark:text-sky-300">
                    已筛选时段: {selectedHour.toString().padStart(2, '0')}:00 -{' '}
                    {(selectedHour + 1).toString().padStart(2, '0')}:00
                  </span>
                  <button
                    onClick={() => setSelectedHour(null)}
                    className="ml-auto text-sky-500 hover:text-sky-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="录音总数"
            value={stats.totalRecordings}
            icon={<Mic size={24} />}
          />
          <StatCard
            title="总时长"
            value={`${Math.floor(stats.totalDuration / 60)}分${stats.totalDuration % 60}秒`}
            icon={<Clock size={24} />}
          />
          <StatCard
            title="平均评分"
            value={`${stats.avgRating} / 5.0`}
            icon={<Star size={24} />}
          />
          <StatCard
            title="平均信噪比"
            value={`${stats.avgSNR} dB`}
            icon={<Signal size={24} />}
          />
        </div>

        <Card glass>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-forest-500" />
                24小时录音分布
              </CardTitle>
              <CardDescription>
                点击图表可筛选对应时段的录音
                {selectedHour !== null && (
                  <span className="ml-2 text-forest-600 font-medium">
                    当前筛选: {selectedHour.toString().padStart(2, '0')}:00 -{' '}
                    {(selectedHour + 1).toString().padStart(2, '0')}:00
                  </span>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Line
                data={timeLineChartData}
                options={{
                  ...chartOptions,
                  onClick: handleTimeChartClick,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart size={20} className="text-sky-500" />
                声音类别分布
              </CardTitle>
              <CardDescription>各类别声音的录音数量统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={categoryChartData} options={chartOptions} />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(categoryStats).map(([key, count]) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg',
                      selectedCategory === key
                        ? 'bg-forest-100 dark:bg-forest-900/50'
                        : 'bg-earth-50 dark:bg-earth-900/30'
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: TAG_CATEGORIES[key as TagCategory].color,
                      }}
                    />
                    <span className="text-sm text-earth-600 dark:text-earth-400">
                      {TAG_CATEGORIES[key as TagCategory].label}: {count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-sunset-500" />
                季节分布
              </CardTitle>
              <CardDescription>各季节录音数量占比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut data={seasonChartData} options={doughnutOptions} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(seasonStats).map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-2 rounded-lg bg-earth-50 dark:bg-earth-900/30"
                  >
                    {getSeasonIcon(key)}
                    <span className="text-sm text-earth-600 dark:text-earth-400">
                      {SEASONS[key as keyof typeof SEASONS].label}: {count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} className="text-sunset-500" />
                评分分布
              </CardTitle>
              <CardDescription>录音质量评分的分布情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Bar data={ratingChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signal size={20} className="text-forest-500" />
                信噪比分布
              </CardTitle>
              <CardDescription>信号与噪音的比值分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Bar data={snrChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud size={20} className="text-sky-500" />
                天气状况统计
              </CardTitle>
              <CardDescription>不同天气下的录音数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Pie data={weatherChartData} options={doughnutOptions} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(weatherStats)
                  .filter(([, count]) => count > 0)
                  .map(([key, count]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-earth-50 dark:bg-earth-900/30"
                    >
                      <span className="text-sky-500">
                        {getWeatherIcon(key as WeatherType)}
                      </span>
                      <span className="text-sm text-earth-600 dark:text-earth-400">
                        {WEATHER_TYPES[key as WeatherType].label}: {count}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic size={20} className="text-earth-500" />
                设备使用统计
              </CardTitle>
              <CardDescription>各录音设备的使用频率</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {equipmentStats.map((equip, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-earth-50 dark:bg-earth-900/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-forest-100 dark:bg-forest-800/50 flex items-center justify-center text-forest-600 dark:text-forest-400">
                      <Mic size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-earth-700 dark:text-earth-300">
                        {equip.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-earth-500 dark:text-earth-400">
                    {equip.count} 次
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags size={20} className="text-forest-500" />
              热门标签
            </CardTitle>
            <CardDescription>点击标签查看该声音的详细时间分布分析</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tagStats.slice(0, 15).map((tag) => (
                <Tag
                  key={tag.id}
                  tag={tag}
                  selected={selectedTagForAnalysis === tag.id}
                  onClick={() =>
                    setSelectedTagForAnalysis(
                      selectedTagForAnalysis === tag.id ? null : tag.id
                    )
                  }
                  size="md"
                />
              ))}
            </div>
            <div className="space-y-2">
              {tagStats.slice(0, 8).map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Tag tag={tag} size="sm" />
                    <span className="text-sm text-earth-500 dark:text-earth-400">
                      {tag.count} 次
                    </span>
                  </div>
                  <div className="w-32 h-2 bg-earth-100 dark:bg-earth-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(tag.count / (tagStats[0]?.count || 1)) * 100}%`,
                        backgroundColor: tag.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedTagForAnalysis && tagTimeDistribution && (
          <Card glass className="border-2 border-forest-500/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-forest-500" />
                  特定声音时间分布分析
                  <Tag
                    tag={tags.find((t) => t.id === selectedTagForAnalysis)!}
                    size="sm"
                  />
                </CardTitle>
                <CardDescription>
                  {mostActiveHour && mostActiveHour.count > 0 ? (
                    <span>
                      最活跃时段:{' '}
                      <span className="text-forest-600 font-medium">
                        {mostActiveHour.hour.toString().padStart(2, '0')}:00 -{' '}
                        {(mostActiveHour.hour + 1).toString().padStart(2, '0')}:00
                      </span>{' '}
                      ，共 {mostActiveHour.count} 条录音
                    </span>
                  ) : (
                    '暂无该标签的录音数据'
                  )}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTagForAnalysis(null)}
              >
                <X size={16} className="mr-1" />
                关闭
              </Button>
            </CardHeader>
            <CardContent>
              {tagTimeChartData && (
                <div className="h-64 mb-6">
                  <Bar data={tagTimeChartData} options={chartOptions} />
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                  该标签的录音列表 ({filteredRecordings.length} 条)
                </h4>
                {filteredRecordings.length === 0 ? (
                  <div className="text-center py-8 text-earth-500 dark:text-earth-400">
                    暂无符合条件的录音
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRecordings.map((recording) => (
                      <RecordingCard
                        key={recording.id}
                        recording={recording}
                        compact
                        onClick={() => navigate(`/archive/${recording.id}`)}
                        onPlay={() => playRecording(recording)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card glass>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} className="text-forest-500" />
                录音列表
              </CardTitle>
              <CardDescription>
                共 {filteredRecordings.length} 条录音
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 bg-forest-100 dark:bg-forest-900/50 text-forest-700 dark:text-forest-400 rounded-full text-xs">
                    已筛选
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/archive')}
            >
              查看全部
            </Button>
          </CardHeader>
          <CardContent>
            {filteredRecordings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                  <BarChart3 size={24} className="text-earth-400" />
                </div>
                <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                  没有找到匹配的录音
                </h3>
                <p className="text-earth-500 dark:text-earth-400 mb-6">
                  尝试调整筛选条件
                </p>
                {hasActiveFilters && (
                  <Button variant="secondary" onClick={clearAllFilters}>
                    清除筛选条件
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecordings.slice(0, 9).map((recording) => (
                  <RecordingCard
                    key={recording.id}
                    recording={recording}
                    compact
                    onClick={() => navigate(`/archive/${recording.id}`)}
                    onPlay={() => playRecording(recording)}
                  />
                ))}
              </div>
            )}
            {filteredRecordings.length > 9 && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/archive')}
                  rightIcon={<ArrowRight size={16} />}
                >
                  查看更多 ({filteredRecordings.length - 9} 条)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analysis;
