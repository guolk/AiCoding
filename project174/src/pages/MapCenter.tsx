import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Layers,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  Calendar,
  Clock,
  ThermometerSun,
  Snowflake,
  Sun,
  Leaf,
  Sunrise,
  Sunset,
  Moon,
  Search,
  X,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag, TagFilter, CategoryFilter } from '@/components/ui/Tag';
import { MapView, MapLegend, MapStats } from '@/components/map/MapView';
import { useRecordingStore } from '@/store/useRecordingStore';
import { useMapStore } from '@/store/useMapStore';
import { generateHeatmapData } from '@/data/recordings';
import { getSeasonFromDate, getTimeOfDayFromDate, formatDateTime } from '@/utils/date';
import { formatDuration as formatAudioDuration } from '@/utils/audio';
import { Recording, SEASONS, TIMES_OF_DAY, Season, TimeOfDay } from '@/types';

const MapCenter: React.FC = () => {
  const navigate = useNavigate();
  const { recordings, tags } = useRecordingStore();
  const {
    showHeatmap,
    showMarkers,
    toggleHeatmap,
    toggleMarkers,
    flyToLocation,
  } = useMapStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay | null>(null);

  const filteredRecordings = useMemo(() => {
    let result = [...recordings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.locationName.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter(r =>
        r.tags.some(t => selectedTags.includes(t.id))
      );
    }

    if (selectedCategory) {
      result = result.filter(r =>
        r.tags.some(t => t.category === selectedCategory)
      );
    }

    if (selectedSeason) {
      result = result.filter(r => getSeasonFromDate(r.recordTime) === selectedSeason);
    }

    if (selectedTimeOfDay) {
      result = result.filter(r => getTimeOfDayFromDate(r.recordTime) === selectedTimeOfDay);
    }

    return result;
  }, [recordings, searchQuery, selectedTags, selectedCategory, selectedSeason, selectedTimeOfDay]);

  const heatmapData = useMemo(() => {
    return generateHeatmapData(filteredRecordings);
  }, [filteredRecordings]);

  const stats = useMemo(() => {
    const uniqueLocations = new Set(
      filteredRecordings
        .filter(r => r.gpsLocation)
        .map(r => `${r.gpsLocation!.latitude.toFixed(2)},${r.gpsLocation!.longitude.toFixed(2)}`)
    ).size;

    const totalTags = new Set(
      filteredRecordings.flatMap(r => r.tags.map(t => t.id))
    ).size;

    return {
      recordingCount: filteredRecordings.length,
      locationCount: uniqueLocations,
      tagCount: totalTags,
    };
  }, [filteredRecordings]);

  const handleMarkerClick = (recording: Recording) => {
    navigate(`/archive/${recording.id}`);
  };

  const handleRecordingClick = (recording: Recording) => {
    if (recording.gpsLocation) {
      flyToLocation(recording.gpsLocation.latitude, recording.gpsLocation.longitude, 12);
    }
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedCategory(null);
    setSelectedSeason(null);
    setSelectedTimeOfDay(null);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedCategory || selectedSeason || selectedTimeOfDay;

  const SeasonIcon = ({ season }: { season: Season }) => {
    switch (season) {
      case 'spring': return <Leaf size={14} />;
      case 'summer': return <Sun size={14} />;
      case 'autumn': return <ThermometerSun size={14} />;
      case 'winter': return <Snowflake size={14} />;
    }
  };

  const TimeIcon = ({ time }: { time: TimeOfDay }) => {
    switch (time) {
      case 'dawn': return <Sunrise size={14} />;
      case 'morning': return <Sun size={14} />;
      case 'afternoon': return <Sun size={14} />;
      case 'dusk': return <Sunset size={14} />;
      case 'night': return <Moon size={14} />;
      case 'midnight': return <Moon size={14} />;
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-earth-900 dark:text-earth-100 font-display flex items-center gap-3">
                <MapPin size={32} className="text-forest-600" />
                地理标注
              </h1>
              <p className="text-earth-600 dark:text-earth-400 mt-2">
                在地图上探索声音的分布，发现自然声景的地理规律
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={showHeatmap ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<Layers size={16} />}
                onClick={toggleHeatmap}
              >
                {showHeatmap ? '隐藏热力图' : '显示热力图'}
              </Button>
              <Button
                variant={showMarkers ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<MapPin size={16} />}
                onClick={toggleMarkers}
              >
                {showMarkers ? '隐藏标记点' : '显示标记点'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-4 px-6 pb-6 min-h-0">
          <div className="flex-1 relative min-h-0">
            <Card glass className="h-full overflow-hidden">
              <div className="relative h-full">
                <MapView
                  recordings={filteredRecordings}
                  heatmapPoints={heatmapData}
                  showHeatmap={showHeatmap}
                  showMarkers={showMarkers}
                  height="100%"
                  onMarkerClick={handleMarkerClick}
                />
                <MapLegend />
                <MapStats recordings={filteredRecordings} />
              </div>
            </Card>
          </div>

          <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-80' : 'w-12'} flex-shrink-0`}>
            <Card glass className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-earth-100 dark:border-forest-800">
                {sidebarOpen && (
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter size={18} />
                      控制面板
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      筛选和定位录音地点
                    </CardDescription>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="flex-shrink-0"
                >
                  {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
              </div>

              {sidebarOpen && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                      <Input
                        placeholder="搜索录音..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-xs"
                        onClick={clearFilters}
                      >
                        <X size={12} className="mr-1" />
                        清除所有筛选
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 flex items-center gap-2">
                      <Layers size={14} />
                      声音类别
                    </h4>
                    <CategoryFilter
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                    />
                  </div>

                  {(!selectedCategory || selectedTags.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300">
                        标签筛选
                      </h4>
                      <TagFilter
                        tags={tags}
                        selectedTags={selectedTags}
                        onTagClick={handleTagClick}
                        category={selectedCategory || undefined}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 flex items-center gap-2">
                      <Calendar size={14} />
                      季节
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(SEASONS) as Season[]).map((season) => (
                        <button
                          key={season}
                          onClick={() => setSelectedSeason(selectedSeason === season ? null : season)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedSeason === season
                              ? 'text-white'
                              : 'bg-earth-100 dark:bg-earth-900/50 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-800/50'
                          }`}
                          style={{
                            backgroundColor: selectedSeason === season ? SEASONS[season].color : undefined,
                          }}
                        >
                          <SeasonIcon season={season} />
                          {SEASONS[season].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 flex items-center gap-2">
                      <Clock size={14} />
                      时段
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(TIMES_OF_DAY) as TimeOfDay[]).map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTimeOfDay(selectedTimeOfDay === time ? null : time)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedTimeOfDay === time
                              ? 'bg-forest-600 text-white'
                              : 'bg-earth-100 dark:bg-earth-900/50 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-800/50'
                          }`}
                        >
                          <TimeIcon time={time} />
                          {TIMES_OF_DAY[time].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        录音列表
                      </span>
                      <span className="text-xs text-earth-500">
                        共 {filteredRecordings.length} 条
                      </span>
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredRecordings.length === 0 ? (
                        <div className="text-center py-8 text-earth-500 dark:text-earth-400">
                          <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">没有找到匹配的录音</p>
                        </div>
                      ) : (
                        filteredRecordings.map((recording) => (
                          <div
                            key={recording.id}
                            onClick={() => handleRecordingClick(recording)}
                            className="p-3 rounded-lg bg-earth-50 dark:bg-forest-800/30 hover:bg-forest-50 dark:hover:bg-forest-800/50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-earth-900 dark:text-earth-100 text-sm truncate group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
                                  {recording.title}
                                </h5>
                                <p className="text-xs text-earth-500 dark:text-earth-400 mt-0.5 flex items-center gap-1">
                                  <MapPin size={10} />
                                  {recording.locationName}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-earth-500 dark:text-earth-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    {formatDateTime(recording.recordTime)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatAudioDuration(recording.audioMetadata?.duration || 0)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {recording.tags.slice(0, 2).map((tag) => (
                                    <Tag key={tag.id} tag={tag} size="sm" />
                                  ))}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/archive/${recording.id}`);
                                }}
                              >
                                <Play size={14} />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapCenter;
