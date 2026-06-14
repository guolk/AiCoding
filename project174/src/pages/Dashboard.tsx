import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MapPin,
  Tags,
  Disc,
  Play,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Volume2,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RecordingCard } from '@/components/recording/RecordingCard';
import { Tag } from '@/components/ui/Tag';
import { useRecordingStore } from '@/store/useRecordingStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { generateMockTimeDistribution, generateHeatmapData } from '@/data/recordings';
import { getSeasonFromDate } from '@/utils/date';
import { SEASONS } from '@/types';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { recordings, collections, tags } = useRecordingStore();
  const { playRecording: playerPlayRecording } = usePlayerStore();

  const stats = useMemo(() => {
    const totalDuration = recordings.reduce(
      (sum, r) => sum + (r.audioMetadata?.duration || 0),
      0
    );
    const totalSize = recordings.reduce(
      (sum, r) => sum + (r.audioMetadata?.fileSize || 0),
      0
    );
    const uniqueLocations = new Set(recordings.map((r) => r.locationName)).size;
    const avgRating =
      recordings.reduce(
        (sum, r) => sum + (r.qualityAssessment?.overallRating || 0),
        0
      ) / recordings.length;

    return {
      totalRecordings: recordings.length,
      totalCollections: collections.length,
      totalTags: tags.length,
      uniqueLocations,
      totalDuration,
      totalSize,
      avgRating: avgRating.toFixed(1),
    };
  }, [recordings, collections, tags]);

  const recentRecordings = useMemo(() => {
    return [...recordings]
      .sort((a, b) => new Date(b.recordTime).getTime() - new Date(a.recordTime).getTime())
      .slice(0, 6);
  }, [recordings]);

  const tagStats = useMemo(() => {
    const tagCount: Record<string, number> = {};
    recordings.forEach((r) => {
      r.tags.forEach((t) => {
        tagCount[t.id] = (tagCount[t.id] || 0) + 1;
      });
    });
    return tags
      .map((t) => ({ ...t, count: tagCount[t.id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [recordings, tags]);

  const seasonStats = useMemo(() => {
    const seasonCount: Record<string, number> = {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    };
    recordings.forEach((r) => {
      const season = getSeasonFromDate(r.recordTime);
      seasonCount[season]++;
    });
    return seasonCount;
  }, [recordings]);

  const timeDistribution = useMemo(() => {
    return generateMockTimeDistribution(recordings);
  }, [recordings]);

  const heatmapData = useMemo(() => {
    return generateHeatmapData(recordings);
  }, [recordings]);

  const lineChartData = {
    labels: timeDistribution.map((d) => `${d.hour.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: '录音数量',
        data: timeDistribution.map((d) => d.count),
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e',
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const doughnutChartData = {
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

  const barChartData = {
    labels: tagStats.slice(0, 6).map((t) => t.name),
    datasets: [
      {
        label: '使用次数',
        data: tagStats.slice(0, 6).map((t) => t.count),
        backgroundColor: tagStats.slice(0, 6).map((t) => t.color + '80'),
        borderColor: tagStats.slice(0, 6).map((t) => t.color),
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

  const handlePlayRandom = () => {
    const randomIndex = Math.floor(Math.random() * recordings.length);
    const randomRecording = recordings[randomIndex];
    if (randomRecording) {
      playerPlayRecording(randomRecording);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-earth-900 dark:text-earth-100 font-display">
              欢迎回到声景收藏馆
            </h1>
            <p className="text-earth-600 dark:text-earth-400 mt-2">
              探索你收藏的自然声音，记录每一段难忘的听觉记忆
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              leftIcon={<Play size={18} />}
              onClick={handlePlayRandom}
            >
              随机播放
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => navigate('/archive/new')}
            >
              新建录音
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总录音数"
            value={stats.totalRecordings}
            icon={<Mic size={24} />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="收藏地点"
            value={stats.uniqueLocations}
            icon={<MapPin size={24} />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="收藏集"
            value={stats.totalCollections}
            icon={<Disc size={24} />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="标签总数"
            value={stats.totalTags}
            icon={<Tags size={24} />}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glass className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} className="text-forest-500" />
                  24小时录音分布
                </CardTitle>
                <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                  查看你在不同时段的录音活跃情况
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/analysis')}
              >
                详细分析
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-sunset-500" />
                季节分布
              </CardTitle>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                各季节录音数量占比
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut data={doughnutChartData} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card glass className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Headphones size={20} className="text-forest-500" />
                  最近录音
                </CardTitle>
                <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                  你最新添加的 {recentRecordings.length} 条录音
                </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentRecordings.map((recording) => (
                  <RecordingCard
                    key={recording.id}
                    recording={recording}
                    compact
                    onClick={() => navigate(`/archive/${recording.id}`)}
                    onPlay={() => {}}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={20} className="text-sunset-500" />
                热门标签
              </CardTitle>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                最常使用的声音标签
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-48">
                <Bar data={barChartData} options={chartOptions} />
              </div>
              <div className="space-y-2">
                {tagStats.slice(0, 5).map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between"
                  >
                    <Tag tag={tag} size="sm" />
                    <span className="text-sm text-earth-500 dark:text-earth-400">
                      {tag.count} 次
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-forest-500" />
              快速概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-forest-50 dark:bg-forest-900/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-600 dark:text-forest-400">
                    <Volume2 size={20} />
                  </div>
                  <span className="font-medium text-earth-700 dark:text-earth-300">
                    总时长
                  </span>
                </div>
                <p className="text-2xl font-bold text-earth-900 dark:text-earth-100">
                  {Math.floor(stats.totalDuration / 60)} 分
                  <span className="text-lg text-earth-500 dark:text-earth-400">
                    {stats.totalDuration % 60} 秒
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-800 text-sky-600 dark:text-sky-400">
                    <Disc size={20} />
                  </div>
                  <span className="font-medium text-earth-700 dark:text-earth-300">
                    文件大小
                  </span>
                </div>
                <p className="text-2xl font-bold text-earth-900 dark:text-earth-100">
                  {(stats.totalSize / (1024 * 1024)).toFixed(1)}{' '}
                  <span className="text-lg text-earth-500 dark:text-earth-400">MB</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sunset-50 dark:bg-sunset-900/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-sunset-100 dark:bg-sunset-800 text-sunset-600 dark:text-sunset-400">
                    <Sparkles size={20} />
                  </div>
                  <span className="font-medium text-earth-700 dark:text-earth-300">
                    平均评分
                  </span>
                </div>
                <p className="text-2xl font-bold text-earth-900 dark:text-earth-100">
                  {stats.avgRating}{' '}
                  <span className="text-lg text-earth-500 dark:text-earth-400">
                    / 5.0
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-earth-50 dark:bg-earth-900/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-earth-400">
                    <MapPin size={20} />
                  </div>
                  <span className="font-medium text-earth-700 dark:text-earth-300">
                    热力点数
                  </span>
                </div>
                <p className="text-2xl font-bold text-earth-900 dark:text-earth-100">
                  {heatmapData.length}{' '}
                  <span className="text-lg text-earth-500 dark:text-earth-400">
                    个地点
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '录音档案',
              description: '管理所有自然声音录音',
              icon: <Mic size={24} />,
              color: 'forest',
              path: '/archive',
            },
            {
              title: '地理标注',
              description: '在地图上探索声音分布',
              icon: <MapPin size={24} />,
              color: 'sky',
              path: '/map',
            },
            {
              title: '声音分析',
              description: '深入分析音频特征',
              icon: <TrendingUp size={24} />,
              color: 'sunset',
              path: '/analysis',
            },
          ].map((item, index) => (
            <Card
              key={index}
              hover
              glass
              onClick={() => navigate(item.path)}
              className="cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                      item.color === 'forest'
                        ? 'bg-forest-100 dark:bg-forest-800/50 text-forest-600 dark:text-forest-400'
                        : item.color === 'sky'
                        ? 'bg-sky-100 dark:bg-sky-800/50 text-sky-600 dark:text-sky-400'
                        : 'bg-sunset-100 dark:bg-sunset-800/50 text-sunset-600 dark:text-sunset-400'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-100 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-earth-300 dark:text-earth-600 group-hover:text-forest-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
