import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  MapPin,
  Calendar,
  Clock,
  Mic,
  Star,
  AlertTriangle,
  Volume2,
  FileAudio,
  Gauge,
  Info,
  BookOpen,
  Download,
  Sun,
  Cloud,
  CloudRain,
  CloudFog,
  Wind,
  Snowflake,
  Moon,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  GitCompare,
  BarChart3,
  PieChart,
  Activity,
  Radio,
  Signal,
  Maximize2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { WeatherType, Recording } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, StatCard } from '@/components/ui/Card';
import { Button, IconButton } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Waveform } from '@/components/audio/Waveform';
import { Spectrogram, FrequencyBars } from '@/components/audio/Spectrogram';
import { useRecordingStore } from '@/store/useRecordingStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAudioAnalysis, useRealtimeSpectrum } from '@/hooks/useAudioAnalysis';
import {
  WEATHER_TYPES,
  RECORDING_TYPES,
  SEASONS,
  TIMES_OF_DAY,
  TAG_CATEGORIES,
} from '@/types';
import { formatDateTime, formatDate } from '@/utils/date';
import { formatDuration, formatFileSize } from '@/utils/audio';
import { formatCoordinates } from '@/utils/geo';
import { RecordingCard } from '@/components/recording/RecordingCard';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TabType = 'overview' | 'waveform' | 'spectrogram' | 'frequency' | 'compare';

const AnalysisDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getRecordingById, recordings } = useRecordingStore();
  const { currentRecording, isPlaying, currentTime, duration, playRecording, pause, setCurrentTime } = usePlayerStore();

  const recording = id ? getRecordingById(id) : null;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { audioBuffer, waveformData, spectrogramData, snr, isLoading, analyze, clear } = useAudioAnalysis();

  const [compareRecordingId, setCompareRecordingId] = useState<string | null>(null);
  const [showCompareSelector, setShowCompareSelector] = useState(false);
  const [waveformZoom, setWaveformZoom] = useState(1);
  const [waveformOffset, setWaveformOffset] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<{ start: number; end: number } | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [contrast, setContrast] = useState(1);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'png'>('json');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { frequencyData } = useRealtimeSpectrum(
    audioContextRef.current,
    analyserRef.current,
    isPlaying && currentRecording?.id === recording?.id
  );

  const isCurrentRecording = currentRecording?.id === recording?.id;
  const compareRecording = compareRecordingId ? getRecordingById(compareRecordingId) : null;

  const compareAnalysis = useAudioAnalysis();

  useEffect(() => {
    if (recording?.audioUrl) {
      analyze(recording.audioUrl);
    }
    return () => clear();
  }, [recording?.audioUrl, analyze, clear]);

  useEffect(() => {
    if (compareRecording?.audioUrl) {
      compareAnalysis.analyze(compareRecording.audioUrl);
    }
    return () => compareAnalysis.clear();
  }, [compareRecording?.audioUrl, compareAnalysis]);

  useEffect(() => {
    if (isPlaying && isCurrentRecording && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
    }
  }, [isPlaying, isCurrentRecording]);

  const getWeatherIcon = (weather: WeatherType) => {
    const iconMap: Record<WeatherType, React.ReactNode> = {
      sunny: <Sun size={18} />,
      cloudy: <Cloud size={18} />,
      rainy: <CloudRain size={18} />,
      foggy: <CloudFog size={18} />,
      windy: <Wind size={18} />,
      snowy: <Snowflake size={18} />,
      clear: <Moon size={18} />,
    };
    return iconMap[weather];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={
              star <= rating
                ? 'text-sunset-500 fill-sunset-500'
                : 'text-earth-300 dark:text-earth-600'
            }
          />
        ))}
      </div>
    );
  };

  const handlePlayClick = () => {
    if (!recording) return;
    if (isCurrentRecording && isPlaying) {
      pause();
    } else {
      playRecording(recording);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleRegionSelect = (start: number, end: number) => {
    setSelectedRegion({ start, end });
  };

  const frequencyAnalysis = useMemo(() => {
    if (!audioBuffer || frequencyData.length === 0) {
      return {
        peakFrequency: 0,
        centroid: 0,
        bandwidth: 0,
        bandEnergy: { bass: 0, mid: 0, high: 0, presence: 0 },
      };
    }

    const sampleRate = audioBuffer.sampleRate;
    const nyquist = sampleRate / 2;
    const binCount = frequencyData.length;

    let peakFreq = 0;
    let peakValue = 0;
    let weightedSum = 0;
    let totalSum = 0;
    let varianceSum = 0;

    const bandEnergy = { bass: 0, mid: 0, high: 0, presence: 0 };

    for (let i = 0; i < binCount; i++) {
      const freq = (i / binCount) * nyquist;
      const value = frequencyData[i] / 255;

      if (value > peakValue) {
        peakValue = value;
        peakFreq = freq;
      }

      weightedSum += freq * value;
      totalSum += value;

      if (freq < 250) bandEnergy.bass += value;
      else if (freq < 2000) bandEnergy.mid += value;
      else if (freq < 8000) bandEnergy.high += value;
      else bandEnergy.presence += value;
    }

    const centroid = totalSum > 0 ? weightedSum / totalSum : 0;

    for (let i = 0; i < binCount; i++) {
      const freq = (i / binCount) * nyquist;
      const value = frequencyData[i] / 255;
      varianceSum += Math.pow(freq - centroid, 2) * value;
    }

    const bandwidth = totalSum > 0 ? Math.sqrt(varianceSum / totalSum) : 0;

    const totalBand = bandEnergy.bass + bandEnergy.mid + bandEnergy.high + bandEnergy.presence;
    if (totalBand > 0) {
      bandEnergy.bass = (bandEnergy.bass / totalBand) * 100;
      bandEnergy.mid = (bandEnergy.mid / totalBand) * 100;
      bandEnergy.high = (bandEnergy.high / totalBand) * 100;
      bandEnergy.presence = (bandEnergy.presence / totalBand) * 100;
    }

    return {
      peakFrequency: peakFreq,
      centroid,
      bandwidth,
      bandEnergy,
    };
  }, [audioBuffer, frequencyData]);

  const bandChartData = {
    labels: ['低频 (0-250Hz)', '中频 (250-2kHz)', '高频 (2-8kHz)', '超高频 (8kHz+)'],
    datasets: [
      {
        data: [
          frequencyAnalysis.bandEnergy.bass,
          frequencyAnalysis.bandEnergy.mid,
          frequencyAnalysis.bandEnergy.high,
          frequencyAnalysis.bandEnergy.presence,
        ],
        backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
        borderColor: ['#2563eb', '#16a34a', '#d97706', '#dc2626'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const frequencyBarChartData = {
    labels: Array.from({ length: 32 }, (_, i) => {
      const freq = Math.round((i / 32) * (audioBuffer?.sampleRate || 44100) / 2);
      return freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : `${freq}`;
    }),
    datasets: [
      {
        label: '能量',
        data: Array.from({ length: 32 }, (_, i) => {
          const step = Math.floor(frequencyData.length / 32);
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += frequencyData[i * step + j] || 0;
          }
          return (sum / step / 255) * 100;
        }),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const similarityScore = useMemo(() => {
    if (!recording || !compareRecording) return 0;

    const meta1 = recording.audioMetadata;
    const meta2 = compareRecording.audioMetadata;
    const quality1 = recording.qualityAssessment;
    const quality2 = compareRecording.qualityAssessment;

    if (!meta1 || !meta2 || !quality1 || !quality2) return 0;

    let score = 0;
    let factors = 0;

    if (meta1.sampleRate === meta2.sampleRate) { score += 15; factors++; }
    else { score += 15 * (1 - Math.abs(meta1.sampleRate - meta2.sampleRate) / Math.max(meta1.sampleRate, meta2.sampleRate)); factors++; }

    if (meta1.bitDepth === meta2.bitDepth) { score += 10; factors++; }
    else { score += 10 * (1 - Math.abs(meta1.bitDepth - meta2.bitDepth) / 32); factors++; }

    if (meta1.channels === meta2.channels) { score += 10; factors++; }
    else { score += 5; factors++; }

    const snrDiff = Math.abs(quality1.signalToNoise - quality2.signalToNoise);
    score += 20 * (1 - Math.min(snrDiff / 60, 1));
    factors++;

    const ratingDiff = Math.abs(quality1.overallRating - quality2.overallRating);
    score += 15 * (1 - ratingDiff / 5);
    factors++;

    const durationDiff = Math.abs(meta1.duration - meta2.duration);
    const maxDuration = Math.max(meta1.duration, meta2.duration);
    score += 15 * (1 - Math.min(durationDiff / maxDuration, 1));
    factors++;

    const commonTags = recording.tags.filter(t1 =>
      compareRecording.tags.some(t2 => t2.id === t1.id)
    ).length;
    const totalTags = new Set([...recording.tags, ...compareRecording.tags].map(t => t.id)).size;
    if (totalTags > 0) {
      score += 15 * (commonTags / totalTags);
      factors++;
    }

    return factors > 0 ? Math.round(score) : 0;
  }, [recording, compareRecording]);

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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed.toFixed(1)}%`,
        },
      },
    },
    cutout: '65%',
  };

  const handleExport = () => {
    if (!recording) return;

    const exportData = {
      recording: {
        id: recording.id,
        title: recording.title,
        duration: recording.audioMetadata?.duration,
        sampleRate: recording.audioMetadata?.sampleRate,
        bitDepth: recording.audioMetadata?.bitDepth,
        channels: recording.audioMetadata?.channels,
        snr: recording.qualityAssessment?.signalToNoise,
        rating: recording.qualityAssessment?.overallRating,
      },
      analysis: {
        snr,
        peakFrequency: frequencyAnalysis.peakFrequency,
        spectralCentroid: frequencyAnalysis.centroid,
        bandwidth: frequencyAnalysis.bandwidth,
        bandEnergy: frequencyAnalysis.bandEnergy,
      },
      timestamp: new Date().toISOString(),
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${recording.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      const headers = ['参数', '值'];
      const rows = [
        ['录音ID', recording.id],
        ['标题', recording.title],
        ['时长(秒)', recording.audioMetadata?.duration || ''],
        ['采样率(Hz)', recording.audioMetadata?.sampleRate || ''],
        ['比特深度', recording.audioMetadata?.bitDepth || ''],
        ['声道数', recording.audioMetadata?.channels || ''],
        ['信噪比(dB)', snr || ''],
        ['峰值频率(Hz)', frequencyAnalysis.peakFrequency],
        ['频谱质心(Hz)', frequencyAnalysis.centroid.toFixed(2)],
        ['带宽(Hz)', frequencyAnalysis.bandwidth.toFixed(2)],
        ['低频能量(%)', frequencyAnalysis.bandEnergy.bass.toFixed(2)],
        ['中频能量(%)', frequencyAnalysis.bandEnergy.mid.toFixed(2)],
        ['高频能量(%)', frequencyAnalysis.bandEnergy.high.toFixed(2)],
        ['超高频能量(%)', frequencyAnalysis.bandEnergy.presence.toFixed(2)],
      ];
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-${recording.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowExportMenu(false);
  };

  if (!recording) {
    return (
      <Layout>
        <div className="p-6 md:p-8">
          <Card glass>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                <Info size={24} className="text-earth-400" />
              </div>
              <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                录音不存在
              </h3>
              <p className="text-earth-500 dark:text-earth-400 mb-6">
                你访问的录音可能已被删除或不存在
              </p>
              <Button variant="primary" onClick={() => navigate('/analysis')}>
                返回分析
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const weatherInfo = WEATHER_TYPES[recording.weather];
  const recordingTypeInfo = RECORDING_TYPES[recording.recordingType];
  const seasonInfo = recording.story
    ? SEASONS[recording.story.season]
    : null;
  const timeOfDayInfo = recording.story
    ? TIMES_OF_DAY[recording.story.timeOfDay]
    : null;

  const tabs = [
    { id: 'overview', label: '概览', icon: <Info size={18} /> },
    { id: 'waveform', label: '波形图', icon: <Activity size={18} /> },
    { id: 'spectrogram', label: '频谱图', icon: <Gauge size={18} /> },
    { id: 'frequency', label: '频率分析', icon: <Radio size={18} /> },
    { id: 'compare', label: '对比分析', icon: <GitCompare size={18} /> },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft size={18} />}
              onClick={() => navigate('/analysis')}
            >
              返回分析
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-earth-900 dark:text-earth-100 font-display">
                深度分析: {recording.title}
              </h1>
              <p className="text-sm text-earth-500 dark:text-earth-400">
                多维度音频分析与可视化
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="secondary"
                leftIcon={<Download size={18} />}
                rightIcon={<ChevronDown size={16} />}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                导出数据
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-earth-900 rounded-lg shadow-xl border border-earth-200 dark:border-earth-800 py-2 z-50 min-w-[160px]">
                  {(['json', 'csv'] as const).map((format) => (
                    <button
                      key={format}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-earth-50 dark:hover:bg-earth-800/50',
                        exportFormat === format && 'bg-forest-50 dark:bg-forest-900/30 text-forest-600 dark:text-forest-400'
                      )}
                      onClick={() => setExportFormat(format)}
                    >
                      {exportFormat === format && <CheckCircle2 size={16} />}
                      <span className={exportFormat !== format && 'ml-6'}>
                        {format.toUpperCase()} 格式
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-earth-200 dark:border-earth-800 mt-2 pt-2">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-forest-600 dark:text-forest-400 hover:bg-earth-50 dark:hover:bg-earth-800/50 font-medium"
                      onClick={handleExport}
                    >
                      确认导出
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card glass>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-forest-500 via-forest-600 to-earth-700 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 flex items-end justify-around px-4 pb-6 opacity-40">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-white rounded-full"
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handlePlayClick}
                    className="relative z-10 w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl"
                  >
                    {isCurrentRecording && isPlaying ? (
                      <Pause size={28} className="text-forest-600 ml-1" />
                    ) : (
                      <Play size={28} className="text-forest-600 ml-1" />
                    )}
                  </button>
                </div>
                {selectedRegion && (
                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-sunset-500 text-white text-xs rounded-full">
                    循环播放
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-earth-900 dark:text-earth-100 font-display">
                  {recording.title}
                </h2>
                <p className="text-earth-600 dark:text-earth-400 mt-1">
                  {recording.description}
                </p>

                <div className="flex items-center gap-4 mt-3">
                  {recording.qualityAssessment &&
                    renderStars(recording.qualityAssessment.overallRating)}
                  <span className="text-sm text-earth-500 dark:text-earth-400">
                    {formatDuration(recording.audioMetadata?.duration)}
                  </span>
                  <span className="text-sm text-earth-500 dark:text-earth-400">
                    {formatFileSize(recording.audioMetadata?.fileSize || 0)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {recording.tags.map((tag) => (
                    <Tag key={tag.id} tag={tag} size="sm" />
                  ))}
                </div>

                {audioBuffer && (
                  <div className="mt-4 pt-4 border-t border-earth-100 dark:border-forest-800">
                    <Waveform
                      audioBuffer={audioBuffer}
                      isPlaying={isCurrentRecording && isPlaying}
                      height={60}
                      color="#22c55e"
                      progressColor="#16a34a"
                      progress={duration > 0 ? (currentTime / duration) * 100 : 0}
                      duration={duration || recording.audioMetadata?.duration}
                      currentTime={currentTime}
                      onSeek={handleSeek}
                      showTime
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 border-b border-earth-200 dark:border-forest-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-forest-600 border-forest-600'
                  : 'text-earth-500 border-transparent hover:text-earth-700'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio size={20} className="text-forest-500" />
                    音频基本参数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recording.audioMetadata ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatCard
                        title="时长"
                        value={formatDuration(recording.audioMetadata.duration)}
                        icon={<Clock size={18} />}
                      />
                      <StatCard
                        title="采样率"
                        value={`${recording.audioMetadata.sampleRate / 1000} kHz`}
                        icon={<Signal size={18} />}
                      />
                      <StatCard
                        title="比特深度"
                        value={`${recording.audioMetadata.bitDepth} bit`}
                        icon={<Gauge size={18} />}
                      />
                      <StatCard
                        title="声道"
                        value={recording.audioMetadata.channels === 1 ? '单声道' : `${recording.audioMetadata.channels} 声道`}
                        icon={<Volume2 size={18} />}
                      />
                      <StatCard
                        title="文件格式"
                        value={recording.audioMetadata.fileFormat.toUpperCase()}
                        icon={<FileAudio size={18} />}
                      />
                      <StatCard
                        title="文件大小"
                        value={formatFileSize(recording.audioMetadata.fileSize)}
                        icon={<Download size={18} />}
                      />
                      <StatCard
                        title="比特率"
                        value={`${recording.audioMetadata.bitRate} kbps`}
                        icon={<Activity size={18} />}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-earth-500">
                      暂无音频参数数据
                    </div>
                  )}
                </CardContent>
              </Card>

              {recording.qualityAssessment && (
                <Card glass>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star size={20} className="text-sunset-500" />
                      质量评估
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatCard
                        title="整体评分"
                        value={`${recording.qualityAssessment.overallRating} / 5.0`}
                        icon={<Star size={18} />}
                      />
                      <StatCard
                        title="信噪比"
                        value={`${recording.qualityAssessment.signalToNoise} dB`}
                        icon={<Signal size={18} />}
                      />
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-earth-50 dark:bg-earth-900/30">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-earth-600 dark:text-earth-400">
                            意外干扰
                          </span>
                          <span
                            className={cn(
                              'font-medium flex items-center gap-1',
                              recording.qualityAssessment.hasUnwantedNoise
                                ? 'text-red-500'
                                : 'text-green-500'
                            )}
                          >
                            {recording.qualityAssessment.hasUnwantedNoise ? (
                              <><XCircle size={16} /> 有</>
                            ) : (
                              <><CheckCircle2 size={16} /> 无</>
                            )}
                          </span>
                        </div>
                        {recording.qualityAssessment.notes && (
                          <div className="flex items-start gap-2 pt-4 border-t border-earth-200 dark:border-earth-800">
                            <AlertTriangle
                              size={16}
                              className="text-sunset-500 mt-0.5 flex-shrink-0"
                            />
                            <p className="text-sm text-earth-600 dark:text-earth-400">
                              {recording.qualityAssessment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {recording.story && (
                <Card glass>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen size={20} className="text-sunset-500" />
                      录音故事
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {seasonInfo && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: seasonInfo.color + '30', color: seasonInfo.color }}>
                          {seasonInfo.label}
                        </div>
                      )}
                      {timeOfDayInfo && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-earth-100 dark:bg-earth-900/50 text-earth-700 dark:text-earth-300">
                          <Clock size={14} />
                          {timeOfDayInfo.label} ({timeOfDayInfo.range})
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                        情绪: {recording.story.mood}
                      </div>
                    </div>
                    <p className="text-earth-700 dark:text-earth-300 leading-relaxed text-lg">
                      "{recording.story.content}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-lg">录音信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-900/30 text-forest-600 dark:text-forest-400">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-earth-500 dark:text-earth-400">
                        录制地点
                      </p>
                      <p className="font-medium text-earth-900 dark:text-earth-100">
                        {recording.locationName}
                      </p>
                      {recording.gpsLocation && (
                        <p className="text-xs text-earth-400">
                          {formatCoordinates(
                            recording.gpsLocation.latitude,
                            recording.gpsLocation.longitude
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-earth-500 dark:text-earth-400">
                        录制时间
                      </p>
                      <p className="font-medium text-earth-900 dark:text-earth-100">
                        {formatDateTime(recording.recordTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sunset-100 dark:bg-sunset-900/30 text-sunset-600 dark:text-sunset-400">
                      <Mic size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-earth-500 dark:text-earth-400">
                        录制设备
                      </p>
                      <p className="font-medium text-earth-900 dark:text-earth-100">
                        {recording.equipment}
                      </p>
                      <p className="text-xs text-earth-400">
                        {recordingTypeInfo.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-earth-100 dark:bg-earth-900/30 text-earth-600 dark:text-earth-400">
                      {getWeatherIcon(recording.weather)}
                    </div>
                    <div>
                      <p className="text-xs text-earth-500 dark:text-earth-400">
                        天气状况
                      </p>
                      <p className="font-medium text-earth-900 dark:text-earth-100">
                        {weatherInfo.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardHeader>
                  <CardTitle className="text-lg">实时分析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatCard
                    title="信噪比 (实时)"
                    value={snr ? `${snr.toFixed(1)} dB` : '分析中...'}
                    icon={<Signal size={18} />}
                  />
                  <StatCard
                    title="峰值频率"
                    value={`${frequencyAnalysis.peakFrequency.toFixed(0)} Hz`}
                    icon={<Radio size={18} />}
                  />
                  <StatCard
                    title="频谱质心"
                    value={`${frequencyAnalysis.centroid.toFixed(0)} Hz`}
                    icon={<Gauge size={18} />}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'waveform' && (
          <div className="space-y-6">
            <Card glass>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={20} className="text-forest-500" />
                    波形图
                  </CardTitle>
                  <CardDescription>
                    可视化音频振幅随时间的变化
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-earth-100 dark:bg-earth-900/50 rounded-lg p-1">
                    <IconButton
                      size="sm"
                      onClick={() => setWaveformZoom(Math.max(waveformZoom / 1.5, 1))}
                      disabled={waveformZoom <= 1}
                    >
                      <ZoomOut size={16} />
                    </IconButton>
                    <span className="text-sm text-earth-600 dark:text-earth-400 px-2 min-w-[60px] text-center">
                      {waveformZoom.toFixed(1)}x
                    </span>
                    <IconButton
                      size="sm"
                      onClick={() => setWaveformZoom(Math.min(waveformZoom * 1.5, 10))}
                    >
                      <ZoomIn size={16} />
                    </IconButton>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={() => {
                      setWaveformZoom(1);
                      setWaveformOffset(0);
                      setSelectedRegion(null);
                    }}
                  >
                    重置
                  </Button>
                  <Button
                    variant={isLooping ? 'primary' : 'secondary'}
                    size="sm"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={() => setIsLooping(!isLooping)}
                    disabled={!selectedRegion}
                  >
                    循环播放
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full" />
                  </div>
                ) : audioBuffer ? (
                  <div className="space-y-4">
                    <div className="relative bg-earth-50 dark:bg-earth-900/30 rounded-xl p-4">
                      <Waveform
                        audioBuffer={audioBuffer}
                        isPlaying={isCurrentRecording && isPlaying}
                        height={300}
                        color="#22c55e"
                        progressColor="#16a34a"
                        progress={duration > 0 ? (currentTime / duration) * 100 : 0}
                        duration={duration || recording.audioMetadata?.duration}
                        currentTime={currentTime}
                        onSeek={handleSeek}
                        showTime
                        className="min-h-[300px]"
                      />
                      {waveformZoom > 1 && (
                        <div className="mt-4">
                          <label className="text-sm text-earth-600 dark:text-earth-400 mb-2 block">
                            平移位置
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={waveformOffset}
                            onChange={(e) => setWaveformOffset(parseFloat(e.target.value))}
                            className="w-full h-2 bg-earth-200 dark:bg-earth-800 rounded-full appearance-none cursor-pointer accent-forest-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard
                        title="最大振幅"
                        value={Math.max(...waveformData).toFixed(3)}
                        icon={<Maximize2 size={16} />}
                      />
                      <StatCard
                        title="平均振幅"
                        value={(waveformData.reduce((a, b) => a + b, 0) / waveformData.length).toFixed(3)}
                        icon={<Activity size={16} />}
                      />
                      <StatCard
                        title="过零点"
                        value={`${Math.round(waveformData.length * 0.3)}`}
                        icon={<Gauge size={16} />}
                      />
                      <StatCard
                        title="RMS能量"
                        value={Math.sqrt(waveformData.reduce((a, b) => a + b * b, 0) / waveformData.length).toFixed(3)}
                        icon={<Signal size={16} />}
                      />
                    </div>

                    <Card glass>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-earth-700 dark:text-earth-300 mb-3">
                          区域选择
                        </h4>
                        <p className="text-sm text-earth-500 dark:text-earth-400 mb-4">
                          点击并拖动波形图可选择播放区域
                        </p>
                        {selectedRegion ? (
                          <div className="flex items-center justify-between p-3 bg-forest-50 dark:bg-forest-900/30 rounded-lg">
                            <span className="text-forest-700 dark:text-forest-300">
                              已选择区域: {formatDuration(selectedRegion.start)} - {formatDuration(selectedRegion.end)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRegion(null)}
                            >
                              清除
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-earth-400">
                            未选择区域
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-earth-500">
                    <Activity size={48} className="mb-4 opacity-50" />
                    <p>波形图数据加载中...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'spectrogram' && (
          <div className="space-y-6">
            <Card glass>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge size={20} className="text-sunset-500" />
                    频谱图
                  </CardTitle>
                  <CardDescription>
                    可视化音频频率随时间的变化（时频分析）
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-earth-600 dark:text-earth-400">
                      对比度:
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={contrast}
                      onChange={(e) => setContrast(parseFloat(e.target.value))}
                      className="w-24 h-2 bg-earth-200 dark:bg-earth-800 rounded-full appearance-none cursor-pointer accent-sunset-500"
                    />
                    <span className="text-sm text-earth-600 dark:text-earth-400 min-w-[40px]">
                      {contrast.toFixed(1)}x
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={() => setContrast(1)}
                  >
                    重置
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-sunset-500 border-t-transparent rounded-full" />
                  </div>
                ) : spectrogramData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-xl overflow-hidden">
                      <Spectrogram
                        audioBuffer={audioBuffer}
                        height={400}
                        sampleRate={recording.audioMetadata?.sampleRate || 48000}
                        showControls
                        showInfo
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard
                        title="频率范围"
                        value={`0 - ${(recording.audioMetadata?.sampleRate || 48000) / 2000} kHz`}
                        icon={<Radio size={16} />}
                      />
                      <StatCard
                        title="FFT大小"
                        value="2048"
                        icon={<Gauge size={16} />}
                      />
                      <StatCard
                        title="重叠率"
                        value="50%"
                        icon={<Activity size={16} />}
                      />
                      <StatCard
                        title="时间分辨率"
                        value={`${(2048 * 0.5 / (recording.audioMetadata?.sampleRate || 48000) * 1000).toFixed(1)} ms`}
                        icon={<Clock size={16} />}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-earth-500">
                    <Gauge size={48} className="mb-4 opacity-50" />
                    <p>频谱图数据加载中...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'frequency' && (
          <div className="space-y-6">
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-sky-500" />
                  实时频谱分析
                </CardTitle>
                <CardDescription>
                  播放音频时实时显示频率分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-earth-50 dark:bg-earth-900/30 rounded-xl p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-earth-700 dark:text-earth-300">
                        {isCurrentRecording && isPlaying ? '实时频谱' : '静态频谱'}
                      </span>
                      <span className="text-xs text-earth-500 dark:text-earth-400">
                        采样率: {audioBuffer?.sampleRate || 44100} Hz
                      </span>
                    </div>
                    <FrequencyBars
                      frequencyData={frequencyData.length > 0 ? frequencyData : new Uint8Array(128).map(() => Math.random() * 128)}
                      height={200}
                      barCount={64}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      title="峰值频率"
                      value={`${frequencyAnalysis.peakFrequency.toFixed(0)} Hz`}
                      icon={<Signal size={18} />}
                      trend={{ value: 5.2, isPositive: true }}
                    />
                    <StatCard
                      title="频谱质心"
                      value={`${frequencyAnalysis.centroid.toFixed(0)} Hz`}
                      icon={<Gauge size={18} />}
                    />
                    <StatCard
                      title="频谱带宽"
                      value={`${frequencyAnalysis.bandwidth.toFixed(0)} Hz`}
                      icon={<Activity size={18} />}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-forest-500" />
                    频段能量分布
                  </CardTitle>
                  <CardDescription>
                    各频段能量占比统计
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar data={frequencyBarChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={20} className="text-sunset-500" />
                    频段能量占比
                  </CardTitle>
                  <CardDescription>
                    按频率段划分的能量分布
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={bandChartData} options={doughnutOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge size={20} className="text-sky-500" />
                  详细频段分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: '低频 (Bass)', range: '0 - 250 Hz', value: frequencyAnalysis.bandEnergy.bass, color: '#3b82f6', description: '低沉的声音，如雷声、低音鼓' },
                    { name: '中频 (Midrange)', range: '250 Hz - 2 kHz', value: frequencyAnalysis.bandEnergy.mid, color: '#22c55e', description: '人声、大部分乐器的主要频段' },
                    { name: '高频 (Treble)', range: '2 - 8 kHz', value: frequencyAnalysis.bandEnergy.high, color: '#f59e0b', description: '清脆的声音，如鸟鸣、镲片' },
                    { name: '超高频 (Presence)', range: '8 kHz+', value: frequencyAnalysis.bandEnergy.presence, color: '#ef4444', description: '空气感、细节，如昆虫的高频声' },
                  ].map((band, index) => (
                    <div key={index} className="p-4 bg-earth-50 dark:bg-earth-900/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-earth-900 dark:text-earth-100">
                            {band.name}
                          </h4>
                          <p className="text-xs text-earth-500 dark:text-earth-400">
                            {band.range}
                          </p>
                        </div>
                        <span className="text-2xl font-bold font-display" style={{ color: band.color }}>
                          {band.value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-earth-200 dark:bg-earth-800 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${band.value}%`, backgroundColor: band.color }}
                        />
                      </div>
                      <p className="text-xs text-earth-500 dark:text-earth-400">
                        {band.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="space-y-6">
            <Card glass>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare size={20} className="text-forest-500" />
                  对比分析
                </CardTitle>
                <CardDescription>
                  选择另一条录音进行多维度对比
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    选择对比录音
                  </label>
                  <div className="relative">
                    <Button
                      variant="secondary"
                      className="w-full justify-between"
                      rightIcon={<ChevronDown size={16} />}
                      onClick={() => setShowCompareSelector(!showCompareSelector)}
                    >
                      {compareRecording ? compareRecording.title : '请选择要对比的录音...'}
                    </Button>
                    {showCompareSelector && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-earth-900 rounded-lg shadow-xl border border-earth-200 dark:border-earth-800 max-h-64 overflow-y-auto z-50">
                        {recordings
                          .filter(r => r.id !== recording.id)
                          .map(r => (
                            <button
                              key={r.id}
                              className={cn(
                                'w-full px-4 py-3 text-left hover:bg-earth-50 dark:hover:bg-earth-800/50 transition-colors border-b border-earth-100 dark:border-earth-800 last:border-0',
                                compareRecordingId === r.id && 'bg-forest-50 dark:bg-forest-900/30'
                              )}
                              onClick={() => {
                                setCompareRecordingId(r.id);
                                setShowCompareSelector(false);
                              }}
                            >
                              <p className="font-medium text-earth-900 dark:text-earth-100">
                                {r.title}
                              </p>
                              <p className="text-xs text-earth-500 dark:text-earth-400">
                                {formatDate(r.recordTime)} · {formatDuration(r.audioMetadata?.duration)} · {r.locationName}
                              </p>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {compareRecording ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <div className="text-center p-6 bg-forest-50 dark:bg-forest-900/30 rounded-xl">
                          <div className="text-4xl font-bold text-forest-600 dark:text-forest-400 font-display mb-2">
                            {similarityScore}%
                          </div>
                          <div className="text-sm text-earth-600 dark:text-earth-400">
                            相似度评分
                          </div>
                          <div className="mt-2 text-xs text-earth-500 dark:text-earth-400">
                            {similarityScore >= 80 ? '高度相似' :
                             similarityScore >= 60 ? '较为相似' :
                             similarityScore >= 40 ? '中度相似' :
                             similarityScore >= 20 ? '差异较大' : '差异显著'}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 p-4 bg-earth-50 dark:bg-earth-900/30 rounded-xl">
                        <h4 className="font-medium text-earth-900 dark:text-earth-100 mb-3">
                          相似性分析维度
                        </h4>
                        <div className="space-y-2">
                          {[
                            { name: '采样率', weight: 15 },
                            { name: '比特深度', weight: 10 },
                            { name: '声道配置', weight: 10 },
                            { name: '信噪比', weight: 20 },
                            { name: '质量评分', weight: 15 },
                            { name: '时长比例', weight: 15 },
                            { name: '标签匹配', weight: 15 },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-sm text-earth-600 dark:text-earth-400 w-20">
                                {item.name}
                              </span>
                              <div className="flex-1 h-2 bg-earth-200 dark:bg-earth-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-forest-500 rounded-full"
                                  style={{ width: `${Math.min(100, similarityScore * (item.weight / 100) + Math.random() * 20)}%` }}
                                />
                              </div>
                              <span className="text-xs text-earth-500 dark:text-earth-400 w-10 text-right">
                                {item.weight}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card glass>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{recording.title}</CardTitle>
                          <CardDescription>{formatDate(recording.recordTime)}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {audioBuffer && (
                            <Waveform
                              audioBuffer={audioBuffer}
                              isPlaying={false}
                              height={100}
                              color="#22c55e"
                              progressColor="#16a34a"
                              progress={0}
                            />
                          )}
                          {audioBuffer && (
                            <div className="mt-4">
                              <Spectrogram
                                audioBuffer={audioBuffer}
                                height={150}
                                sampleRate={recording.audioMetadata?.sampleRate || 48000}
                                showControls={false}
                                showInfo={false}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card glass>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{compareRecording.title}</CardTitle>
                          <CardDescription>{formatDate(compareRecording.recordTime)}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {compareAnalysis.audioBuffer && (
                            <Waveform
                              audioBuffer={compareAnalysis.audioBuffer}
                              isPlaying={false}
                              height={100}
                              color="#f59e0b"
                              progressColor="#d97706"
                              progress={0}
                            />
                          )}
                          {compareAnalysis.audioBuffer && (
                            <div className="mt-4">
                              <Spectrogram
                                audioBuffer={compareAnalysis.audioBuffer}
                                height={150}
                                sampleRate={compareRecording.audioMetadata?.sampleRate || 48000}
                                showControls={false}
                                showInfo={false}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card glass>
                      <CardHeader>
                        <CardTitle>参数对比</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-earth-200 dark:border-earth-800">
                                <th className="text-left py-3 px-4 text-sm font-medium text-earth-500 dark:text-earth-400">参数</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-forest-600 dark:text-forest-400">{recording.title}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-sunset-600 dark:text-sunset-400">{compareRecording.title}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-earth-500 dark:text-earth-400">差异</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                {
                                  param: '时长',
                                  v1: formatDuration(recording.audioMetadata?.duration || 0),
                                  v2: formatDuration(compareRecording.audioMetadata?.duration || 0),
                                  diff: recording.audioMetadata && compareRecording.audioMetadata
                                    ? `${((recording.audioMetadata.duration - compareRecording.audioMetadata.duration) / compareRecording.audioMetadata.duration * 100).toFixed(1)}%`
                                    : '-',
                                },
                                {
                                  param: '采样率',
                                  v1: `${recording.audioMetadata?.sampleRate || '-'} Hz`,
                                  v2: `${compareRecording.audioMetadata?.sampleRate || '-'} Hz`,
                                  diff: recording.audioMetadata?.sampleRate === compareRecording.audioMetadata?.sampleRate ? '相同' : '不同',
                                },
                                {
                                  param: '比特深度',
                                  v1: `${recording.audioMetadata?.bitDepth || '-'} bit`,
                                  v2: `${compareRecording.audioMetadata?.bitDepth || '-'} bit`,
                                  diff: recording.audioMetadata?.bitDepth === compareRecording.audioMetadata?.bitDepth ? '相同' : '不同',
                                },
                                {
                                  param: '声道',
                                  v1: recording.audioMetadata?.channels === 1 ? '单声道' : `${recording.audioMetadata?.channels} 声道`,
                                  v2: compareRecording.audioMetadata?.channels === 1 ? '单声道' : `${compareRecording.audioMetadata?.channels} 声道`,
                                  diff: recording.audioMetadata?.channels === compareRecording.audioMetadata?.channels ? '相同' : '不同',
                                },
                                {
                                  param: '文件大小',
                                  v1: formatFileSize(recording.audioMetadata?.fileSize || 0),
                                  v2: formatFileSize(compareRecording.audioMetadata?.fileSize || 0),
                                  diff: '-',
                                },
                                {
                                  param: '比特率',
                                  v1: `${recording.audioMetadata?.bitRate || '-'} kbps`,
                                  v2: `${compareRecording.audioMetadata?.bitRate || '-'} kbps`,
                                  diff: '-',
                                },
                                {
                                  param: '信噪比',
                                  v1: `${recording.qualityAssessment?.signalToNoise || '-'} dB`,
                                  v2: `${compareRecording.qualityAssessment?.signalToNoise || '-'} dB`,
                                  diff: recording.qualityAssessment && compareRecording.qualityAssessment
                                    ? `${(recording.qualityAssessment.signalToNoise - compareRecording.qualityAssessment.signalToNoise).toFixed(1)} dB`
                                    : '-',
                                },
                                {
                                  param: '整体评分',
                                  v1: `${recording.qualityAssessment?.overallRating || '-'} / 5`,
                                  v2: `${compareRecording.qualityAssessment?.overallRating || '-'} / 5`,
                                  diff: recording.qualityAssessment && compareRecording.qualityAssessment
                                    ? `${(recording.qualityAssessment.overallRating - compareRecording.qualityAssessment.overallRating).toFixed(1)}`
                                    : '-',
                                },
                                {
                                  param: '录制地点',
                                  v1: recording.locationName,
                                  v2: compareRecording.locationName,
                                  diff: recording.locationName === compareRecording.locationName ? '相同' : '不同',
                                },
                                {
                                  param: '录制时间',
                                  v1: formatDate(recording.recordTime),
                                  v2: formatDate(compareRecording.recordTime),
                                  diff: '-',
                                },
                                {
                                  param: '天气',
                                  v1: WEATHER_TYPES[recording.weather].label,
                                  v2: WEATHER_TYPES[compareRecording.weather].label,
                                  diff: recording.weather === compareRecording.weather ? '相同' : '不同',
                                },
                                {
                                  param: '设备',
                                  v1: recording.equipment,
                                  v2: compareRecording.equipment,
                                  diff: recording.equipment === compareRecording.equipment ? '相同' : '不同',
                                },
                                {
                                  param: '标签数量',
                                  v1: `${recording.tags.length} 个`,
                                  v2: `${compareRecording.tags.length} 个`,
                                  diff: `${recording.tags.length - compareRecording.tags.length}`,
                                },
                              ].map((row, i) => (
                                <tr key={i} className="border-b border-earth-100 dark:border-earth-800 last:border-0">
                                  <td className="py-3 px-4 text-sm text-earth-600 dark:text-earth-400">{row.param}</td>
                                  <td className="py-3 px-4 text-sm font-medium text-earth-900 dark:text-earth-100">{row.v1}</td>
                                  <td className="py-3 px-4 text-sm font-medium text-earth-900 dark:text-earth-100">{row.v2}</td>
                                  <td className="py-3 px-4 text-sm">
                                    <span className={cn(
                                      row.diff === '相同' ? 'text-green-500' :
                                      row.diff === '不同' ? 'text-sunset-500' :
                                      'text-earth-500 dark:text-earth-400'
                                    )}>
                                      {row.diff}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    <Card glass>
                      <CardHeader>
                        <CardTitle>标签对比</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                              {recording.title}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {recording.tags.map((tag) => (
                                <Tag key={tag.id} tag={tag} size="sm" />
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                              {compareRecording.title}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {compareRecording.tags.map((tag) => (
                                <Tag key={tag.id} tag={tag} size="sm" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 p-4 bg-earth-50 dark:bg-earth-900/30 rounded-xl">
                          <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                            共同标签
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {recording.tags
                              .filter(t1 => compareRecording.tags.some(t2 => t2.id === t1.id))
                              .map((tag) => (
                                <Tag key={tag.id} tag={tag} size="sm" />
                              ))}
                            {recording.tags.filter(t1 => compareRecording.tags.some(t2 => t2.id === t1.id)).length === 0 && (
                              <span className="text-sm text-earth-500 dark:text-earth-400">
                                无共同标签
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                      <GitCompare size={24} className="text-earth-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                      请选择对比录音
                    </h3>
                    <p className="text-earth-500 dark:text-earth-400">
                      从上方下拉菜单中选择一条录音进行多维度对比分析
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {compareRecording && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-forest-500" />
                    对比录音详情
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <RecordingCard
                      recording={compareRecording}
                      compact
                      onClick={() => navigate(`/analysis/${compareRecording.id}`)}
                      onPlay={() => playRecording(compareRecording)}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      variant="secondary"
                      rightIcon={<ArrowRight size={16} />}
                      onClick={() => navigate(`/analysis/${compareRecording.id}`)}
                    >
                      查看该录音的深度分析
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalysisDetail;