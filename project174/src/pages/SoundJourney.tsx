import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Repeat,
  Repeat1,
  Calendar,
  Clock,
  MapPin,
  Route,
  Timer,
  ListMusic,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  CloudFog,
  Wind,
  Snowflake,
  Moon,
  Leaf,
  ThermometerSun,
  Sunrise,
  Sunset,
  X,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useRecordingStore } from '@/store/useRecordingStore';
import { useMapStore } from '@/store/useMapStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { haversineDistance, getBounds, getCenter } from '@/utils/geo';
import { formatDateTime, getSeasonFromDate, getTimeOfDayFromDate } from '@/utils/date';
import { formatDuration } from '@/utils/audio';
import { Recording, Season, TimeOfDay, WeatherType, WEATHER_TYPES, SEASONS, TIMES_OF_DAY } from '@/types';
import 'leaflet/dist/leaflet.css';

const STAGE_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

const WeatherIcon: React.FC<{ weather: WeatherType; size?: number }> = ({ weather, size = 14 }) => {
  const iconMap: Record<WeatherType, React.ReactNode> = {
    sunny: <Sun size={size} />,
    cloudy: <Cloud size={size} />,
    rainy: <CloudRain size={size} />,
    foggy: <CloudFog size={size} />,
    windy: <Wind size={size} />,
    snowy: <Snowflake size={size} />,
    clear: <Moon size={size} />,
  };
  return <>{iconMap[weather]}</>;
};

const SeasonIcon: React.FC<{ season: Season; size?: number }> = ({ season, size = 14 }) => {
  const iconMap: Record<Season, React.ReactNode> = {
    spring: <Leaf size={size} />,
    summer: <Sun size={size} />,
    autumn: <ThermometerSun size={size} />,
    winter: <Snowflake size={size} />,
  };
  return <>{iconMap[season]}</>;
};

const TimeIcon: React.FC<{ time: TimeOfDay; size?: number }> = ({ time, size = 14 }) => {
  const iconMap: Record<TimeOfDay, React.ReactNode> = {
    dawn: <Sunrise size={size} />,
    morning: <Sun size={size} />,
    afternoon: <Sun size={size} />,
    dusk: <Sunset size={size} />,
    night: <Moon size={size} />,
    midnight: <Moon size={size} />,
  };
  return <>{iconMap[time]}</>;
};

const createJourneyMarker = (color: string, isActive: boolean, index: number) => {
  return L.divIcon({
    className: 'journey-marker',
    html: `
      <div style="
        width: ${isActive ? '44px' : '36px'};
        height: ${isActive ? '44px' : '36px'};
        background: ${color};
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        ${isActive ? 'transform: scale(1.1);' : ''}
      ">
        <span style="
          color: white;
          font-weight: bold;
          font-size: ${isActive ? '16px' : '14px'};
        ">${index + 1}</span>
      </div>
    `,
    iconSize: isActive ? [44, 44] : [36, 36],
    iconAnchor: isActive ? [22, 22] : [18, 18],
    popupAnchor: [0, -22],
  });
};

const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  shouldFly: boolean;
}> = ({ center, zoom, shouldFly }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldFly) {
      map.flyTo(center, zoom, { duration: 2, easeLinearity: 0.25 });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, shouldFly, map]);
  
  return null;
};

interface JourneySegment {
  from: Recording;
  to: Recording;
  distance: number;
  duration: number;
  color: string;
}

const SoundJourney: React.FC = () => {
  const { recordings } = useRecordingStore();
  const { flyToLocation } = useMapStore();
  const { playRecording, currentRecording, isPlaying, setCurrentRecording } = usePlayerStore();

  const [timelineOpen, setTimelineOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loopMode, setLoopMode] = useState<'none' | 'all' | 'one'>('none');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const sortedRecordings = useMemo(() => {
    return [...recordings]
      .filter(r => r.gpsLocation)
      .sort((a, b) => new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime());
  }, [recordings]);

  const journeySegments = useMemo((): JourneySegment[] => {
    const segments: JourneySegment[] = [];
    for (let i = 0; i < sortedRecordings.length - 1; i++) {
      const from = sortedRecordings[i];
      const to = sortedRecordings[i + 1];
      if (from.gpsLocation && to.gpsLocation) {
        const distance = haversineDistance(
          from.gpsLocation.latitude,
          from.gpsLocation.longitude,
          to.gpsLocation.latitude,
          to.gpsLocation.longitude,
          'km'
        );
        const duration = (new Date(to.recordTime).getTime() - new Date(from.recordTime).getTime()) / (1000 * 60 * 60);
        segments.push({
          from,
          to,
          distance,
          duration,
          color: STAGE_COLORS[i % STAGE_COLORS.length],
        });
      }
    }
    return segments;
  }, [sortedRecordings]);

  const totalDistance = useMemo(() => {
    return journeySegments.reduce((sum, seg) => sum + seg.distance, 0);
  }, [journeySegments]);

  const totalDuration = useMemo(() => {
    if (sortedRecordings.length < 2) return 0;
    const first = sortedRecordings[0];
    const last = sortedRecordings[sortedRecordings.length - 1];
    return (new Date(last.recordTime).getTime() - new Date(first.recordTime).getTime()) / (1000 * 60 * 60 * 24);
  }, [sortedRecordings]);

  const mapBounds = useMemo(() => {
    const points = sortedRecordings
      .filter(r => r.gpsLocation)
      .map(r => ({ lat: r.gpsLocation!.latitude, lng: r.gpsLocation!.longitude }));
    return getBounds(points);
  }, [sortedRecordings]);

  const mapCenter = useMemo(() => {
    if (currentIndex >= 0 && sortedRecordings[currentIndex]?.gpsLocation) {
      const r = sortedRecordings[currentIndex];
      return [r.gpsLocation!.latitude, r.gpsLocation!.longitude] as [number, number];
    }
    const points = sortedRecordings
      .filter(r => r.gpsLocation)
      .map(r => ({ lat: r.gpsLocation!.latitude, lng: r.gpsLocation!.longitude }));
    return getCenter(points);
  }, [sortedRecordings, currentIndex]);

  const mapZoom = useMemo(() => {
    if (currentIndex >= 0) return 12;
    const latDiff = mapBounds.maxLat - mapBounds.minLat;
    const lngDiff = mapBounds.maxLng - mapBounds.minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    if (maxDiff > 50) return 4;
    if (maxDiff > 20) return 5;
    if (maxDiff > 10) return 6;
    if (maxDiff > 5) return 7;
    if (maxDiff > 2) return 8;
    if (maxDiff > 1) return 9;
    return 10;
  }, [mapBounds, currentIndex]);

  const getPolylinePositions = (segment: JourneySegment): [number, number][] => {
    if (!segment.from.gpsLocation || !segment.to.gpsLocation) return [];
    return [
      [segment.from.gpsLocation.latitude, segment.from.gpsLocation.longitude],
      [segment.to.gpsLocation.latitude, segment.to.gpsLocation.longitude],
    ];
  };

  const handleMarkerClick = useCallback((recording: Recording, index: number) => {
    setCurrentIndex(index);
    playRecording(recording);
    if (recording.gpsLocation) {
      flyToLocation(recording.gpsLocation.latitude, recording.gpsLocation.longitude, 12);
    }
  }, [playRecording, flyToLocation]);

  const handleTimelineClick = useCallback((recording: Recording, index: number) => {
    setCurrentIndex(index);
    if (recording.gpsLocation) {
      flyToLocation(recording.gpsLocation.latitude, recording.gpsLocation.longitude, 12);
    }
  }, [flyToLocation]);

  const handlePlayPause = useCallback(() => {
    if (sortedRecordings.length === 0) return;
    
    if (currentIndex < 0) {
      setCurrentIndex(0);
      const first = sortedRecordings[0];
      playRecording(first);
      setIsAutoPlaying(true);
      return;
    }

    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
      const current = sortedRecordings[currentIndex];
      if (current && currentRecording?.id !== current.id) {
        playRecording(current);
      }
    }
  }, [sortedRecordings, currentIndex, isAutoPlaying, playRecording, currentRecording]);

  const handleNext = useCallback(() => {
    if (sortedRecordings.length === 0) return;
    
    let nextIndex: number;
    if (loopMode === 'one') {
      nextIndex = currentIndex;
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= sortedRecordings.length) {
        if (loopMode === 'all') {
          nextIndex = 0;
        } else {
          setIsAutoPlaying(false);
          return;
        }
      }
    }
    
    setCurrentIndex(nextIndex);
    const next = sortedRecordings[nextIndex];
    playRecording(next);
  }, [sortedRecordings, currentIndex, loopMode, playRecording]);

  const handlePrevious = useCallback(() => {
    if (sortedRecordings.length === 0) return;
    
    if (currentIndex <= 0) {
      if (loopMode === 'all') {
        const lastIndex = sortedRecordings.length - 1;
        setCurrentIndex(lastIndex);
        playRecording(sortedRecordings[lastIndex]);
      }
      return;
    }
    
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    playRecording(sortedRecordings[prevIndex]);
  }, [sortedRecordings, currentIndex, loopMode, playRecording]);

  const toggleLoopMode = useCallback(() => {
    setLoopMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || !isPlaying || currentIndex < 0) return;

    const current = sortedRecordings[currentIndex];
    if (!current) return;

    const duration = current.audioMetadata?.duration || 0;
    const adjustedDuration = duration / playbackSpeed;

    const timer = setTimeout(() => {
      handleNext();
    }, adjustedDuration * 1000);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, isPlaying, currentIndex, sortedRecordings, playbackSpeed, handleNext]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDistance = (km: number): string => {
    if (km < 1) return `${(km * 1000).toFixed(0)} m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${km.toFixed(0)} km`;
  };

  const formatDurationDays = (days: number): string => {
    if (days < 1) return `${Math.round(days * 24)} 小时`;
    if (days < 30) return `${Math.round(days)} 天`;
    return `${Math.round(days / 30)} 个月`;
  };

  if (sortedRecordings.length === 0) {
    return (
      <Layout>
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Route size={48} className="mx-auto mb-4 text-earth-400" />
              <h3 className="text-xl font-semibold text-earth-900 dark:text-earth-100 mb-2">
                暂无旅行数据
              </h3>
              <p className="text-earth-600 dark:text-earth-400">
                您还没有录制带有地理位置的声音。开始录音并添加位置信息，即可生成您的声音旅行图。
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-earth-900 dark:text-earth-100 font-display flex items-center gap-3">
                <Route size={32} className="text-forest-600" />
                声音旅行
              </h1>
              <p className="text-earth-600 dark:text-earth-400 mt-2">
                沿着时间轨迹，探索您记录的每一个声音角落
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400">
                  <MapPin size={16} className="text-forest-600" />
                  <span className="font-semibold text-earth-900 dark:text-earth-100">
                    {sortedRecordings.length}
                  </span>
                  <span>个地点</span>
                </div>
                <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400">
                  <Route size={16} className="text-blue-600" />
                  <span className="font-semibold text-earth-900 dark:text-earth-100">
                    {formatDistance(totalDistance)}
                  </span>
                  <span>总距离</span>
                </div>
                <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400">
                  <Timer size={16} className="text-amber-600" />
                  <span className="font-semibold text-earth-900 dark:text-earth-100">
                    {formatDurationDays(totalDuration)}
                  </span>
                  <span>总时长</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-4 px-6 pb-6 min-h-0">
          <div className="flex-1 relative min-h-0">
            <Card glass className="h-full overflow-hidden">
              <div className="relative h-full">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={true}
                >
                  <MapController
                    center={mapCenter}
                    zoom={mapZoom}
                    shouldFly={currentIndex >= 0}
                  />

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {journeySegments.map((segment, idx) => (
                    <Polyline
                      key={idx}
                      positions={getPolylinePositions(segment)}
                      pathOptions={{
                        color: segment.color,
                        weight: 4,
                        opacity: 0.8,
                        lineCap: 'round',
                        lineJoin: 'round',
                      }}
                    />
                  ))}

                  {journeySegments.map((segment, idx) => (
                    <Polyline
                      key={`dash-${idx}`}
                      positions={getPolylinePositions(segment)}
                      pathOptions={{
                        color: segment.color,
                        weight: 6,
                        opacity: 0,
                        dashArray: '10, 10',
                        className: 'journey-path-animated',
                      }}
                    />
                  ))}

                  {sortedRecordings.map((recording, idx) => {
                    if (!recording.gpsLocation) return null;
                    const isActive = idx === currentIndex;
                    const segmentIdx = idx > 0 ? idx - 1 : 0;
                    const color = STAGE_COLORS[segmentIdx % STAGE_COLORS.length];

                    return (
                      <Marker
                        key={recording.id}
                        position={[recording.gpsLocation.latitude, recording.gpsLocation.longitude]}
                        icon={createJourneyMarker(color, isActive, idx)}
                        eventHandlers={{
                          click: () => handleMarkerClick(recording, idx),
                        }}
                      >
                        <Popup className="p-0 min-w-[280px]">
                          <div className="overflow-hidden">
                            <div
                              className="h-2"
                              style={{ backgroundColor: color }}
                            />
                            <div className="p-4">
                              <h4 className="font-semibold text-earth-900 dark:text-earth-100 text-lg mb-1 font-display">
                                {recording.title}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-earth-500 dark:text-earth-400 mb-2">
                                <MapPin size={14} />
                                <span>{recording.locationName}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-earth-500 dark:text-earth-400 mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>{formatDateTime(recording.recordTime)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{formatDuration(recording.audioMetadata?.duration || 0)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1 text-xs">
                                  <WeatherIcon weather={recording.weather} size={12} />
                                  <span className="text-earth-600 dark:text-earth-400">
                                    {WEATHER_TYPES[recording.weather].label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <SeasonIcon season={getSeasonFromDate(recording.recordTime)} size={12} />
                                  <span className="text-earth-600 dark:text-earth-400">
                                    {SEASONS[getSeasonFromDate(recording.recordTime)].label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <TimeIcon time={getTimeOfDayFromDate(recording.recordTime)} size={12} />
                                  <span className="text-earth-600 dark:text-earth-400">
                                    {TIMES_OF_DAY[getTimeOfDayFromDate(recording.recordTime)].label}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {recording.tags.slice(0, 3).map(tag => (
                                  <Tag key={tag.id} tag={tag} size="sm" />
                                ))}
                              </div>
                              <button
                                onClick={() => handleMarkerClick(recording, idx)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <Play size={16} />
                                播放录音
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>

                <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-forest-900/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <h4 className="text-sm font-semibold text-earth-900 dark:text-earth-100 mb-2 flex items-center gap-2">
                    <Route size={14} />
                    旅行阶段
                  </h4>
                  <div className="space-y-1.5">
                    {journeySegments.slice(0, 5).map((segment, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-earth-600 dark:text-earth-400">
                          {segment.from.locationName} → {segment.to.locationName}
                        </span>
                        <span className="text-earth-400 ml-auto">
                          {formatDistance(segment.distance)}
                        </span>
                      </div>
                    ))}
                    {journeySegments.length > 5 && (
                      <div className="text-xs text-earth-400 text-center pt-1">
                        还有 {journeySegments.length - 5} 段旅程...
                      </div>
                    )}
                  </div>
                </div>

                {currentIndex >= 0 && sortedRecordings[currentIndex] && (
                  <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-forest-900/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: STAGE_COLORS[currentIndex % STAGE_COLORS.length] }}
                      >
                        {currentIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-earth-900 dark:text-earth-100 truncate">
                          {sortedRecordings[currentIndex].title}
                        </h4>
                        <p className="text-xs text-earth-500 dark:text-earth-400 flex items-center gap-1">
                          <MapPin size={10} />
                          {sortedRecordings[currentIndex].locationName}
                        </p>
                      </div>
                    </div>
                    {currentIndex > 0 && journeySegments[currentIndex - 1] && (
                      <div className="mt-2 pt-2 border-t border-earth-100 dark:border-forest-800">
                        <div className="flex items-center justify-between text-xs text-earth-500 dark:text-earth-400">
                          <span>上一段行程</span>
                          <span className="font-medium">
                            {formatDistance(journeySegments[currentIndex - 1].distance)} · {formatDurationDays(journeySegments[currentIndex - 1].duration / 24)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className={`transition-all duration-300 ease-in-out ${timelineOpen ? 'w-80' : 'w-12'} flex-shrink-0`}>
            <Card glass className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-earth-100 dark:border-forest-800">
                {timelineOpen && (
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ListMusic size={18} />
                      旅行时间线
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      按时间顺序浏览您的声音旅程
                    </CardDescription>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTimelineOpen(!timelineOpen)}
                  className="flex-shrink-0"
                >
                  {timelineOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
              </div>

              {timelineOpen && (
                <div className="flex-1 overflow-y-auto">
                  <div className="relative py-4">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-forest-500 via-blue-500 to-amber-500" />

                    {sortedRecordings.map((recording, idx) => {
                      const isActive = idx === currentIndex;
                      const season = getSeasonFromDate(recording.recordTime);
                      const timeOfDay = getTimeOfDayFromDate(recording.recordTime);
                      const color = STAGE_COLORS[idx % STAGE_COLORS.length];

                      return (
                        <div
                          key={recording.id}
                          className={`relative pl-16 pr-4 pb-6 cursor-pointer transition-all ${
                            isActive ? 'scale-[1.02]' : 'hover:bg-earth-50/50 dark:hover:bg-forest-800/20'
                          }`}
                          onClick={() => handleTimelineClick(recording, idx)}
                        >
                          <div
                            className={`absolute left-5 w-6 h-6 rounded-full border-4 border-white dark:border-forest-950 shadow-md transition-all ${
                              isActive ? 'ring-4 ring-forest-300/50 dark:ring-forest-700/50' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />

                          <div
                            className={`p-3 rounded-lg transition-all ${
                              isActive
                                ? 'bg-forest-50 dark:bg-forest-800/50 border-2 border-forest-200 dark:border-forest-700'
                                : 'bg-earth-50/50 dark:bg-forest-900/30 border border-transparent'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className={`font-medium text-sm truncate ${
                                isActive ? 'text-forest-700 dark:text-forest-300' : 'text-earth-900 dark:text-earth-100'
                              }`}>
                                {recording.title}
                              </h5>
                              <span className="flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full bg-earth-200/50 dark:bg-forest-700/50 text-earth-600 dark:text-earth-400">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-earth-500 dark:text-earth-400 mb-2">
                              <MapPin size={10} />
                              <span className="truncate">{recording.locationName}</span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-earth-500 dark:text-earth-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {formatDateTime(recording.recordTime).split(' ')[0]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {formatDuration(recording.audioMetadata?.duration || 0)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                className="p-1 rounded"
                                style={{ backgroundColor: `${SEASONS[season].color}30` }}
                                title={SEASONS[season].label}
                              >
                                <SeasonIcon season={season} size={12} />
                              </div>
                              <div
                                className="p-1 rounded bg-earth-200/50 dark:bg-forest-700/30"
                                title={TIMES_OF_DAY[timeOfDay].label}
                              >
                                <TimeIcon time={timeOfDay} size={12} />
                              </div>
                              <div
                                className="p-1 rounded bg-earth-200/50 dark:bg-forest-700/30"
                                title={WEATHER_TYPES[recording.weather].label}
                              >
                                <WeatherIcon weather={recording.weather} size={12} />
                              </div>
                              {isActive && (
                                <span className="ml-auto flex items-center gap-1 text-forest-600 dark:text-forest-400 text-xs font-medium">
                                  {isAutoPlaying ? <Play size={10} /> : <Pause size={10} />}
                                  播放中
                                </span>
                              )}
                            </div>

                            {idx < journeySegments.length && (
                              <div className="mt-2 pt-2 border-t border-earth-100 dark:border-forest-800">
                                <div className="flex items-center justify-between text-xs text-earth-400 dark:text-earth-500">
                                  <span className="flex items-center gap-1">
                                    <Route size={10} />
                                    下一站: {journeySegments[idx].to.locationName}
                                  </span>
                                  <span>{formatDistance(journeySegments[idx].distance)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="px-6 pb-6 flex-shrink-0">
          <Card glass className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={sortedRecordings.length === 0}
                    >
                      <SkipBack size={20} />
                    </Button>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handlePlayPause}
                      disabled={sortedRecordings.length === 0}
                      className="w-12 h-12 rounded-full p-0"
                    >
                      {isAutoPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      disabled={sortedRecordings.length === 0}
                    >
                      <SkipForward size={20} />
                    </Button>
                  </div>

                  <div className="h-8 w-px bg-earth-200 dark:bg-forest-700" />

                  <div className="text-sm">
                    {currentIndex >= 0 && sortedRecordings[currentIndex] ? (
                      <div>
                        <p className="font-medium text-earth-900 dark:text-earth-100 truncate max-w-xs">
                          {sortedRecordings[currentIndex].title}
                        </p>
                        <p className="text-xs text-earth-500 dark:text-earth-400">
                          {currentIndex + 1} / {sortedRecordings.length} · {sortedRecordings[currentIndex].locationName}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-earth-900 dark:text-earth-100">
                          准备开始声音旅行
                        </p>
                        <p className="text-xs text-earth-500 dark:text-earth-400">
                          共 {sortedRecordings.length} 个录音地点
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative" ref={speedMenuRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Gauge size={16} />}
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    >
                      {playbackSpeed}x
                    </Button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-forest-900 rounded-lg shadow-lg border border-earth-200 dark:border-forest-700 overflow-hidden z-50">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-earth-50 dark:hover:bg-forest-800 transition-colors ${
                              playbackSpeed === speed
                                ? 'text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-800/50'
                                : 'text-earth-700 dark:text-earth-300'
                            }`}
                            onClick={() => handleSpeedChange(speed)}
                          >
                            {speed}x 速度
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant={loopMode !== 'none' ? 'primary' : 'ghost'}
                    size="icon"
                    onClick={toggleLoopMode}
                  >
                    {loopMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                  </Button>
                </div>
              </div>

              {sortedRecordings.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-earth-500 dark:text-earth-400 min-w-[3rem]">
                      {currentIndex >= 0 ? `第 ${currentIndex + 1} 站` : '未开始'}
                    </span>
                    <div className="flex-1 relative h-1 bg-earth-200 dark:bg-forest-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-forest-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${currentIndex >= 0 ? ((currentIndex + 1) / sortedRecordings.length) * 100 : 0}%`,
                        }}
                      />
                      <div className="absolute inset-0 flex">
                        {sortedRecordings.map((_, idx) => (
                          <div
                            key={idx}
                            className="flex-1 border-r border-white/30 dark:border-forest-900/30 last:border-r-0"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-earth-500 dark:text-earth-400 min-w-[3rem] text-right">
                      共 {sortedRecordings.length} 站
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SoundJourney;
