import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bike,
  MapPin,
  Clock,
  Gauge,
  TrendingUp,
  Flame,
  Mountain,
  Trophy,
  Zap,
  Calendar,
  Filter,
  Plus,
  X,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Cloud,
  Snowflake,
  ChevronDown,
  Star,
  Route as RouteIcon,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { RecordTimeline } from '@/components/business/RecordTimeline';
import { useRecordStore } from '@/store/useRecordStore';
import { mockRoutes } from '@/mock/routes';
import { mockRecords } from '@/mock/records';
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatDate,
  formatCalories,
  formatElevation,
} from '@/utils/format';
import type { RideRecord, Weather, RoadCondition, RecordFormData } from '@/types/record';
import { weatherLabels, feelingOptions } from '@/types/record';
import { roadConditionLabels } from '@/utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const weatherIconMap: Record<Weather, React.ElementType> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  windy: Wind,
  hot: Thermometer,
  cold: Snowflake,
};

const weatherColorMap: Record<Weather, string> = {
  sunny: 'bg-yellow-100 text-yellow-600',
  cloudy: 'bg-gray-100 text-gray-600',
  rainy: 'bg-blue-100 text-blue-600',
  windy: 'bg-cyan-100 text-cyan-600',
  hot: 'bg-orange-100 text-orange-600',
  cold: 'bg-sky-100 text-sky-600',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function Records() {
  const { records, loading, fetchRecords, getBestRecords, createRecord } = useRecordStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedWeather, setSelectedWeather] = useState<Weather[]>([]);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showWeatherDropdown, setShowWeatherDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormData>({
    defaultValues: {
      rideDate: new Date().toISOString().split('T')[0],
      weather: 'sunny',
      roadCondition: 'dry',
      feeling: '还不错',
    },
  });

  useEffect(() => {
    loadRecords();
  }, [selectedRoute, selectedYear, selectedWeather]);

  const loadRecords = async () => {
    const filters: Parameters<typeof fetchRecords>[0] = {
      sortBy: 'rideDate',
      sortOrder: 'desc',
      limit: 100,
    };

    if (selectedRoute) {
      filters.routeId = selectedRoute;
    }
    if (selectedWeather.length > 0) {
      filters.weather = selectedWeather;
    }
    if (selectedYear) {
      filters.startDate = `${selectedYear}-01-01`;
      filters.endDate = `${selectedYear}-12-31`;
    }

    await fetchRecords(filters);
  };

  const bestRecords = useMemo(() => getBestRecords(), [records]);

  const stats = useMemo(() => {
    const userRecords = mockRecords;
    const totalRides = userRecords.length;
    const totalDistance = userRecords.reduce((sum, r) => sum + (r.route?.distance || 0), 0);
    const totalTime = userRecords.reduce((sum, r) => sum + r.duration, 0);
    const avgSpeed = totalRides > 0
      ? userRecords.reduce((sum, r) => sum + r.avgSpeed, 0) / totalRides
      : 0;
    const totalElevation = userRecords.reduce((sum, r) => sum + (r.route?.elevation || 0), 0);
    const totalCalories = userRecords.reduce((sum, r) => sum + r.calories, 0);

    return {
      totalRides,
      totalDistance,
      totalTime,
      avgSpeed,
      totalElevation,
      totalCalories,
    };
  }, [records]);

  const bestPersonalRecords = useMemo(() => {
    const userRecords = mockRecords;
    if (userRecords.length === 0) {
      return {
        fastestPace: 0,
        longestDistance: 0,
        highestElevation: 0,
        longestDuration: 0,
      };
    }

    const fastestPace = Math.max(...userRecords.map(r => r.avgSpeed));
    const longestDistance = Math.max(...userRecords.map(r => r.route?.distance || 0));
    const highestElevation = Math.max(...userRecords.map(r => r.route?.elevation || 0));
    const longestDuration = Math.max(...userRecords.map(r => r.duration));

    return {
      fastestPace,
      longestDistance,
      highestElevation,
      longestDuration,
    };
  }, [records]);

  const availableYears = useMemo(() => {
    const years = new Set(
      mockRecords.map(r => new Date(r.rideDate).getFullYear().toString())
    );
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, []);

  const weatherComparisonData = useMemo(() => {
    const weatherTypes: Weather[] = ['sunny', 'rainy', 'windy', 'hot'];
    const result = weatherTypes.map(weather => {
      const weatherRecords = mockRecords.filter(r => r.weather === weather);
      const avgSpeed = weatherRecords.length > 0
        ? weatherRecords.reduce((sum, r) => sum + r.avgSpeed, 0) / weatherRecords.length
        : 0;
      const avgRating = weatherRecords.length > 0
        ? weatherRecords.reduce((sum, r) => {
            const feelingIndex = feelingOptions.indexOf(r.feeling);
            return sum + (6 - feelingIndex);
          }, 0) / weatherRecords.length
        : 0;

      return {
        weather,
        avgSpeed,
        avgRating,
        count: weatherRecords.length,
      };
    });

    return result;
  }, [records]);

  const barChartData = {
    labels: weatherComparisonData.map(d => weatherLabels[d.weather]),
    datasets: [
      {
        label: '平均速度 (km/h)',
        data: weatherComparisonData.map(d => d.avgSpeed.toFixed(1)),
        backgroundColor: 'rgba(15, 118, 110, 0.7)',
        borderColor: 'rgb(15, 118, 110)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: '体验评分 (1-5)',
        data: weatherComparisonData.map(d => d.avgRating.toFixed(1)),
        backgroundColor: 'rgba(249, 115, 22, 0.7)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '不同天气条件下的骑行表现对比',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '速度 (km/h)',
        },
        min: 0,
        max: 40,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '评分',
        },
        min: 0,
        max: 5,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const radarChartData = {
    labels: weatherComparisonData.map(d => weatherLabels[d.weather]),
    datasets: [
      {
        label: '平均速度',
        data: weatherComparisonData.map(d => d.avgSpeed),
        backgroundColor: 'rgba(15, 118, 110, 0.2)',
        borderColor: 'rgb(15, 118, 110)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(15, 118, 110)',
      },
      {
        label: '体验评分',
        data: weatherComparisonData.map(d => d.avgRating * 5),
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(249, 115, 22)',
      },
    ],
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '天气条件雷达图对比',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 40,
      },
    },
  };

  const watchWeather = watch('weather');
  const watchRoadCondition = watch('roadCondition');
  const watchFeeling = watch('feeling');

  const onSubmit = async (data: RecordFormData) => {
    const success = await createRecord(data);
    if (success) {
      setIsModalOpen(false);
      reset();
      loadRecords();
    }
  };

  const toggleWeatherFilter = (weather: Weather) => {
    setSelectedWeather(prev =>
      prev.includes(weather)
        ? prev.filter(w => w !== weather)
        : [...prev, weather]
    );
  };

  const statCards = [
    {
      icon: Bike,
      label: '总骑行次数',
      value: stats.totalRides,
      unit: '次',
      color: 'bg-teal-100 text-teal-600',
    },
    {
      icon: MapPin,
      label: '总里程',
      value: formatDistance(stats.totalDistance),
      unit: '',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Clock,
      label: '总时长',
      value: formatDuration(stats.totalTime),
      unit: '',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Gauge,
      label: '平均速度',
      value: formatSpeed(stats.avgSpeed),
      unit: '',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Mountain,
      label: '累计爬升',
      value: formatElevation(stats.totalElevation),
      unit: '',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Flame,
      label: '总热量',
      value: formatCalories(stats.totalCalories),
      unit: '',
      color: 'bg-red-100 text-red-600',
    },
  ];

  const bestRecordCards = [
    {
      icon: Zap,
      label: '最快配速',
      value: formatSpeed(bestPersonalRecords.fastestPace),
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      iconColor: 'text-yellow-100',
    },
    {
      icon: RouteIcon,
      label: '最长距离',
      value: formatDistance(bestPersonalRecords.longestDistance),
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconColor: 'text-blue-100',
    },
    {
      icon: Mountain,
      label: '最高爬升',
      value: formatElevation(bestPersonalRecords.highestElevation),
      color: 'bg-gradient-to-br from-green-400 to-emerald-600',
      iconColor: 'text-green-100',
    },
    {
      icon: Clock,
      label: '单次最长时间',
      value: formatDuration(bestPersonalRecords.longestDuration),
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      iconColor: 'text-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              骑行记录
            </h1>
            <p className="text-gray-500">
              记录每一次骑行，见证你的成长与突破
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="shadow-lg shadow-teal-500/30"
          >
            <Plus className="w-5 h-5" />
            添加记录
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">统计概览</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card hoverable className="h-full">
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {stat.value}
                          {stat.unit && <span className="text-base ml-1">{stat.unit}</span>}
                        </p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">最佳记录</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {bestRecordCards.map((record, index) => {
                const Icon = record.icon;
                return (
                  <motion.div
                    key={record.label}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card hoverable className="h-full overflow-hidden">
                      <div className={`${record.color} p-4 -m-5 mb-4`}>
                        <div className="flex items-center justify-between">
                          <Icon className={`w-8 h-8 ${record.iconColor}`} />
                          <Badge
                            variant="outline"
                            size="sm"
                            className="bg-white/20 text-white border-white/30"
                          >
                            最佳
                          </Badge>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {record.value}
                      </p>
                      <p className="text-sm text-gray-500">{record.label}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">筛选记录</h2>
            </div>
            <Card>
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRouteDropdown(!showRouteDropdown);
                      setShowYearDropdown(false);
                      setShowWeatherDropdown(false);
                    }}
                    className="min-w-[180px] justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <RouteIcon className="w-4 h-4" />
                      {selectedRoute
                        ? mockRoutes.find(r => r.id === selectedRoute)?.name || '全部路线'
                        : '全部路线'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <AnimatePresence>
                    {showRouteDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20"
                      >
                        <button
                          onClick={() => {
                            setSelectedRoute('');
                            setShowRouteDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                            !selectedRoute ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                          }`}
                        >
                          全部路线
                        </button>
                        {mockRoutes.map(route => (
                          <button
                            key={route.id}
                            onClick={() => {
                              setSelectedRoute(route.id);
                              setShowRouteDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                              selectedRoute === route.id ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                            }`}
                          >
                            <div className="font-medium">{route.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatDistance(route.distance)} · {route.type === 'commute' ? '通勤' : route.type === 'leisure' ? '休闲' : '竞技'}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowYearDropdown(!showYearDropdown);
                      setShowRouteDropdown(false);
                      setShowWeatherDropdown(false);
                    }}
                    className="min-w-[140px] justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedYear || '全部年份'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <AnimatePresence>
                    {showYearDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20"
                      >
                        <button
                          onClick={() => {
                            setSelectedYear('');
                            setShowYearDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                            !selectedYear ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                          }`}
                        >
                          全部年份
                        </button>
                        {availableYears.map(year => (
                          <button
                            key={year}
                            onClick={() => {
                              setSelectedYear(year);
                              setShowYearDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                              selectedYear === year ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                            }`}
                          >
                            {year}年
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowWeatherDropdown(!showWeatherDropdown);
                      setShowRouteDropdown(false);
                      setShowYearDropdown(false);
                    }}
                    className="min-w-[140px] justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      {selectedWeather.length > 0
                        ? `${selectedWeather.length}种天气`
                        : '全部天气'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <AnimatePresence>
                    {showWeatherDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20"
                      >
                        <div className="px-3 py-2 space-y-1">
                          {(Object.keys(weatherLabels) as Weather[]).map(weather => {
                            const WeatherIcon = weatherIconMap[weather];
                            const isSelected = selectedWeather.includes(weather);
                            return (
                              <button
                                key={weather}
                                onClick={() => toggleWeatherFilter(weather)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                  isSelected ? 'bg-teal-50 text-teal-600' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg ${weatherColorMap[weather]} flex items-center justify-center`}>
                                  <WeatherIcon className="w-4 h-4" />
                                </div>
                                <span>{weatherLabels[weather]}</span>
                                {isSelected && (
                                  <div className="ml-auto w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {(selectedRoute || selectedYear || selectedWeather.length > 0) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedRoute('');
                      setSelectedYear('');
                      setSelectedWeather([]);
                    }}
                  >
                    <X className="w-4 h-4" />
                    清除筛选
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">路况体验对比</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="h-80">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </Card>
              <Card>
                <div className="h-80">
                  <Radar data={radarChartData} options={radarChartOptions} />
                </div>
              </Card>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">骑行记录时间线</h2>
              </div>
              <Badge variant="secondary" size="sm">
                共 {records.length} 条记录
              </Badge>
            </div>
            <Card>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                </div>
              ) : (
                <RecordTimeline records={records} />
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-bold text-gray-900">添加骑行记录</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      选择路线
                    </label>
                    <select
                      {...register('routeId', { required: '请选择路线' })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">请选择路线</option>
                      {mockRoutes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.name} ({formatDistance(route.distance)})
                        </option>
                      ))}
                    </select>
                    {errors.routeId && (
                      <p className="mt-1 text-sm text-red-500">{errors.routeId.message}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="骑行日期"
                      type="date"
                      {...register('rideDate', { required: '请选择日期' })}
                      error={errors.rideDate?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      平均速度 (km/h)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="20.0"
                      {...register('avgSpeed', {
                        required: '请输入平均速度',
                        min: { value: 0, message: '速度不能为负数' },
                      })}
                      suffix="km/h"
                      error={errors.avgSpeed?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      最高速度 (km/h)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="35.0"
                      {...register('maxSpeed', {
                        required: '请输入最高速度',
                        min: { value: 0, message: '速度不能为负数' },
                      })}
                      suffix="km/h"
                      error={errors.maxSpeed?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      骑行时长 (分钟)
                    </label>
                    <Input
                      type="number"
                      placeholder="60"
                      {...register('duration', {
                        required: '请输入骑行时长',
                        min: { value: 1, message: '时长至少1分钟' },
                      })}
                      suffix="分钟"
                      error={errors.duration?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      消耗热量 (千卡)
                    </label>
                    <Input
                      type="number"
                      placeholder="300"
                      {...register('calories', {
                        required: '请输入消耗热量',
                        min: { value: 0, message: '热量不能为负数' },
                      })}
                      suffix="千卡"
                      error={errors.calories?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      天气状况
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(weatherLabels) as Weather[]).map(weather => {
                        const WeatherIcon = weatherIconMap[weather];
                        return (
                          <label
                            key={weather}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              watchWeather === weather
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              value={weather}
                              {...register('weather', { required: '请选择天气' })}
                              className="hidden"
                            />
                            <WeatherIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-xs font-medium text-gray-700">
                              {weatherLabels[weather]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.weather && (
                      <p className="mt-1 text-sm text-red-500">{errors.weather.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      路况
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(roadConditionLabels) as RoadCondition[]).map(condition => (
                        <label
                          key={condition}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            watchRoadCondition === condition
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={condition}
                            {...register('roadCondition', { required: '请选择路况' })}
                            className="w-4 h-4 text-teal-600"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {roadConditionLabels[condition]}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.roadCondition && (
                      <p className="mt-1 text-sm text-red-500">{errors.roadCondition.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    骑行感受
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {feelingOptions.map(feeling => (
                      <label
                        key={feeling}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          watchFeeling === feeling
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={feeling}
                          {...register('feeling', { required: '请选择感受' })}
                          className="hidden"
                        />
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-medium text-gray-700">{feeling}</span>
                      </label>
                    ))}
                  </div>
                  {errors.feeling && (
                    <p className="mt-1 text-sm text-red-500">{errors.feeling.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    备注
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="记录这次骑行的心得体会..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={isSubmitting}
                  >
                    保存记录
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
