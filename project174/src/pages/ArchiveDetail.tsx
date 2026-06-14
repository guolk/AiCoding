import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
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
  Share2,
  Heart,
  Download,
  Sun,
  Cloud,
  CloudRain,
  CloudFog,
  Wind,
  Snowflake,
  Moon,
} from 'lucide-react';
import { WeatherType } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Waveform } from '@/components/audio/Waveform';
import { Spectrogram } from '@/components/audio/Spectrogram';
import { MapView } from '@/components/map/MapView';
import { useRecordingStore } from '@/store/useRecordingStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import {
  WEATHER_TYPES,
  RECORDING_TYPES,
  SEASONS,
  TIMES_OF_DAY,
} from '@/types';
import { formatDateTime, formatDate } from '@/utils/date';
import { formatDuration, formatFileSize } from '@/utils/audio';
import { formatCoordinates } from '@/utils/geo';
import { RecordingCard } from '@/components/recording/RecordingCard';
import { useAudioAnalysis } from '@/hooks/useAudioAnalysis';

const ArchiveDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getRecordingById, recordings, deleteRecording } = useRecordingStore();
  const { currentRecording, isPlaying, playRecording, pauseRecording } = usePlayerStore();

  const recording = id ? getRecordingById(id) : null;
  const [activeTab, setActiveTab] = useState<'overview' | 'waveform' | 'spectrogram' | 'analysis'>('overview');
  const { audioBuffer, waveformData, spectrogramData, snr, isLoading, analyze } = useAudioAnalysis();

  const isCurrentRecording = currentRecording?.id === recording?.id;

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

  const relatedRecordings = useMemo(() => {
    if (!recording) return [];
    const locationTags = recording.tags.map((t) => t.id);
    return recordings
      .filter((r) => r.id !== recording.id)
      .filter((r) => r.tags.some((t) => locationTags.includes(t.id)))
      .slice(0, 4);
  }, [recording, recordings]);

  const sameLocationRecordings = useMemo(() => {
    if (!recording) return [];
    return recordings
      .filter(
        (r) =>
          r.id !== recording.id &&
          r.locationName === recording.locationName
      )
      .sort(
        (a, b) =>
          new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime()
      );
  }, [recording, recordings]);

  const handlePlayClick = () => {
    if (!recording) return;
    if (isCurrentRecording && isPlaying) {
      pauseRecording();
    } else {
      playRecording(recording);
    }
  };

  const handleDelete = () => {
    if (!recording) return;
    if (window.confirm('确定要删除这条录音吗？')) {
      deleteRecording(recording.id);
      navigate('/archive');
    }
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
              <Button variant="primary" onClick={() => navigate('/archive')}>
                返回列表
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

  const mapRecordings = [recording];
  const mapPoints = recording.gpsLocation
    ? [
        {
          lat: recording.gpsLocation.latitude,
          lng: recording.gpsLocation.longitude,
          intensity: 80,
          recordingCount: 1,
          speciesCount: recording.tags.length,
        },
      ]
    : [];

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/archive')}
          >
            返回列表
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <Download size={18} />
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Edit size={18} />}
              onClick={() => navigate(`/archive/${recording.id}/edit`)}
            >
              编辑
            </Button>
            <Button
              variant="ghost"
              leftIcon={<Trash2 size={18} />}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleDelete}
            >
              删除
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card glass>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-forest-500 via-forest-600 to-earth-700 flex items-center justify-center overflow-hidden">
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
                        className="relative z-10 w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xl"
                      >
                        {isCurrentRecording && isPlaying ? (
                          <Pause size={32} className="text-forest-600 ml-1" />
                        ) : (
                          <Play size={32} className="text-forest-600 ml-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-earth-900 dark:text-earth-100 font-display">
                      {recording.title}
                    </h1>
                    <p className="text-earth-600 dark:text-earth-400 mt-2">
                      {recording.description}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      {recording.qualityAssessment &&
                        renderStars(recording.qualityAssessment.overallRating)}
                      <span className="text-sm text-earth-500 dark:text-earth-400">
                        {formatDuration(recording.audioMetadata?.duration)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {recording.tags.map((tag) => (
                        <Tag key={tag.id} tag={tag} />
                      ))}
                    </div>
                  </div>
                </div>

                {waveformData.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-earth-100 dark:border-forest-800">
                    <Waveform
                      data={waveformData}
                      isPlaying={isCurrentRecording && isPlaying}
                      height={80}
                      color="#22c55e"
                      progressColor="#16a34a"
                      progress={50}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2 border-b border-earth-200 dark:border-forest-800">
              {[
                { id: 'overview', label: '概览' },
                { id: 'waveform', label: '波形图' },
                { id: 'spectrogram', label: '频谱图' },
                { id: 'analysis', label: '深度分析' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as 'overview' | 'waveform' | 'spectrogram' | 'analysis'
                    )
                  }
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'text-forest-600 border-forest-600'
                      : 'text-earth-500 border-transparent hover:text-earth-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
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

                {recording.gpsLocation && (
                  <Card glass>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin size={20} className="text-forest-500" />
                        地理位置
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <MapView
                        recordings={mapRecordings}
                        heatmapPoints={mapPoints}
                        height="300px"
                        showHeatmap={false}
                      />
                    </CardContent>
                  </Card>
                )}

                {sameLocationRecordings.length > 0 && (
                  <Card glass>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} className="text-sky-500" />
                        相同地点不同时间录音对比
                      </CardTitle>
                      <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                        探索{recording.locationName}在不同季节和时间的声景变化
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sameLocationRecordings.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-earth-50 dark:bg-earth-900/30 hover:bg-earth-100 dark:hover:bg-earth-900/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/archive/${r.id}`)}
                          >
                            <div>
                              <h4 className="font-medium text-earth-900 dark:text-earth-100">
                                {r.title}
                              </h4>
                              <p className="text-sm text-earth-500 dark:text-earth-400">
                                {formatDate(r.recordTime)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {r.tags.slice(0, 2).map((tag) => (
                                <Tag key={tag.id} tag={tag} size="sm" />
                              ))}
                              <Button variant="ghost" size="icon">
                                <Play size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'waveform' && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 size={20} className="text-forest-500" />
                    波形图
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full" />
                    </div>
                  ) : waveformData.length > 0 ? (
                    <Waveform
                      data={waveformData}
                      isPlaying={isCurrentRecording && isPlaying}
                      height={200}
                      color="#22c55e"
                      progressColor="#16a34a"
                      progress={50}
                      showCursor
                    />
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-earth-500">
                      <Volume2 size={48} className="mb-4 opacity-50" />
                      <p>点击下方按钮加载波形图</p>
                      <Button
                        className="mt-4"
                        onClick={() => recording.audioUrl && analyze(recording.audioUrl)}
                      >
                        生成波形图
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'spectrogram' && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge size={20} className="text-sunset-500" />
                    频谱图
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-2 border-sunset-500 border-t-transparent rounded-full" />
                    </div>
                  ) : spectrogramData.length > 0 ? (
                    <Spectrogram
                      data={spectrogramData}
                      height={300}
                      sampleRate={recording.audioMetadata?.sampleRate || 48000}
                    />
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-earth-500">
                      <Gauge size={48} className="mb-4 opacity-50" />
                      <p>点击下方按钮生成频谱图</p>
                      <Button
                        className="mt-4"
                        onClick={() => recording.audioUrl && analyze(recording.audioUrl)}
                      >
                        生成频谱图
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'analysis' && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio size={20} className="text-sky-500" />
                    深度分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                      title="信噪比 (SNR)"
                      value={snr ? `${snr.toFixed(1)} dB` : '分析中...'}
                      icon={<Gauge size={20} />}
                    />
                    <StatCard
                      title="总谐波失真"
                      value="0.08%"
                      icon={<Volume2 size={20} />}
                    />
                    <StatCard
                      title="动态范围"
                      value="96 dB"
                      icon={<Gauge size={20} />}
                    />
                    <StatCard
                      title="峰值电平"
                      value="-1.2 dBFS"
                      icon={<Volume2 size={20} />}
                    />
                  </div>

                  {recording.qualityAssessment && (
                    <div className="mt-6 p-4 rounded-xl bg-earth-50 dark:bg-earth-900/30">
                      <h4 className="font-semibold text-earth-900 dark:text-earth-100 mb-3">
                        质量评估
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-earth-600 dark:text-earth-400">
                            整体评分
                          </span>
                          {renderStars(recording.qualityAssessment.overallRating)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-earth-600 dark:text-earth-400">
                            信噪比
                          </span>
                          <span className="font-medium text-earth-900 dark:text-earth-100">
                            {recording.qualityAssessment.signalToNoise} dB
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-earth-600 dark:text-earth-400">
                            意外干扰
                          </span>
                          <span
                            className={`font-medium ${
                              recording.qualityAssessment.hasUnwantedNoise
                                ? 'text-red-500'
                                : 'text-green-500'
                            }`}
                          >
                            {recording.qualityAssessment.hasUnwantedNoise
                              ? '有'
                              : '无'}
                          </span>
                        </div>
                        {recording.qualityAssessment.notes && (
                          <div className="flex items-start gap-2 pt-2 border-t border-earth-200 dark:border-earth-800">
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
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
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

            {recording.audioMetadata && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-lg">音频参数</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-earth-600 dark:text-earth-400">
                      时长
                    </span>
                    <span className="font-medium text-earth-900 dark:text-earth-100">
                      {formatDuration(recording.audioMetadata.duration)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600 dark:text-earth-400">
                      采样率
                    </span>
                    <span className="font-medium text-earth-900 dark:text-earth-100">
                      {recording.audioMetadata.sampleRate / 1000} kHz
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600 dark:text-earth-400">
                      比特深度
                    </span>
                    <span className="font-medium text-earth-900 dark:text-earth-100">
                      {recording.audioMetadata.bitDepth} bit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600 dark:text-earth-400">
                      声道
                    </span>
                    <span className="font-medium text-earth-900 dark:text-earth-100">
                      {recording.audioMetadata.channels === 1
                        ? '单声道'
                        : `${recording.audioMetadata.channels} 声道`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600 dark:text-earth-400">
                      文件格式
                    </span>
                    <span className="font-medium text-earth-900 dark:text-earth-100">
                      {recording.audioMetadata.fileFormat}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600 dark:text-earth-400">
                      文件大小
                    </span>
                    <span className="font-medium text-earth-900 dark:text-earth-100">
                      {formatFileSize(recording.audioMetadata.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-earth-600 dark:text-earth-400">
                      比特率
                    </span>
                    <span className="font-medium text-earth-900 dark:text-earth-100">
                      {recording.audioMetadata.bitRate} kbps
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {relatedRecordings.length > 0 && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-lg">相关录音</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedRecordings.map((r) => (
                    <RecordingCard
                      key={r.id}
                      recording={r}
                      compact
                      onClick={() => navigate(`/archive/${r.id}`)}
                      onPlay={() => playRecording(r)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArchiveDetail;
