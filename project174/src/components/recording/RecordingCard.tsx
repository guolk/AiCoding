import React, { useState, useRef } from 'react';
import { Play, Pause, MapPin, Calendar, Clock, Mic, Star, AlertTriangle, Volume2, Sun, Cloud, CloudRain, CloudFog, Wind, Snowflake, Moon } from 'lucide-react';
import { Recording, WEATHER_TYPES, RECORDING_TYPES, WeatherType } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button, IconButton } from '@/components/ui/Button';
import { formatDateTime, getRelativeTime } from '@/utils/date';
import { formatDuration } from '@/utils/audio';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useWaveform } from '@/hooks/useWaveform';
import { cn } from '@/lib/utils';

interface RecordingCardProps {
  recording: Recording;
  onClick?: () => void;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showWaveform?: boolean;
  compact?: boolean;
  className?: string;
}

export const RecordingCard: React.FC<RecordingCardProps> = ({
  recording,
  onClick,
  onPlay,
  onEdit,
  onDelete,
  showWaveform = true,
  compact = false,
  className,
}) => {
  const { currentRecording, isPlaying, playRecording, pauseRecording } = usePlayerStore();
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { waveformData, MiniWaveform } = useWaveform(recording.audioUrl || '', {
    samples: 60,
    autoLoad: true,
  });

  const isCurrentRecording = currentRecording?.id === recording.id;
  const weatherInfo = WEATHER_TYPES[recording.weather];
  const recordingTypeInfo = RECORDING_TYPES[recording.recordingType];

  const getWeatherIcon = (weather: WeatherType) => {
    const iconMap: Record<WeatherType, React.ReactNode> = {
      sunny: <Sun size={14} />,
      cloudy: <Cloud size={14} />,
      rainy: <CloudRain size={14} />,
      foggy: <CloudFog size={14} />,
      windy: <Wind size={14} />,
      snowy: <Snowflake size={14} />,
      clear: <Moon size={14} />,
    };
    return iconMap[weather];
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentRecording && isPlaying) {
      pauseRecording();
    } else {
      playRecording(recording);
      onPlay?.();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={cn(
              'transition-colors',
              star <= rating
                ? 'text-sunset-500 fill-sunset-500'
                : 'text-earth-300 dark:text-earth-600'
            )}
          />
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <Card
        hover
        glass
        className={cn('transition-all duration-300', className)}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-white">
                <Volume2 size={20} />
              </div>
              {isHovered && (
                <IconButton
                  variant="filled"
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-6 h-6 p-0"
                  onClick={handlePlayClick}
                >
                  {isCurrentRecording && isPlaying ? <Pause size={12} /> : <Play size={12} />}
                </IconButton>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-earth-900 dark:text-earth-100 truncate">
                {recording.title}
              </h4>
              <div className="flex items-center gap-2 text-sm text-earth-500 dark:text-earth-400 mt-0.5">
                <MapPin size={12} />
                <span className="truncate">{recording.locationName}</span>
                <span>·</span>
                <span>{formatDuration(recording.audioMetadata?.duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {recording.qualityAssessment && renderStars(recording.qualityAssessment.overallRating)}
            </div>
          </div>
          {showWaveform && waveformData.length > 0 && (
            <div className="mt-3 h-8">
              <MiniWaveform
                isPlaying={isCurrentRecording && isPlaying}
                color={isCurrentRecording ? '#16a34a' : '#22c55e'}
                height={32}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      hover
      glass
      className={cn(
        'transition-all duration-300 overflow-hidden',
        isCurrentRecording && 'ring-2 ring-forest-500',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-forest-500 via-forest-600 to-earth-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          
          {showWaveform && waveformData.length > 0 && (
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-4 opacity-60">
              {waveformData.slice(0, 40).map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.max(height * 60, 4)}%`,
                    opacity: isCurrentRecording && isPlaying ? (i % 2 === 0 ? 1 : 0.7) : 0.6,
                    transform: isCurrentRecording && isPlaying ? `scaleY(${0.8 + Math.random() * 0.4})` : 'none',
                  }}
                />
              ))}
            </div>
          )}

          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <div className="flex flex-wrap gap-1.5">
              {recording.tags.slice(0, 2).map((tag) => (
                <Tag key={tag.id} tag={tag} size="sm" />
              ))}
              {recording.tags.length > 2 && (
                <span className="px-2 py-0.5 text-xs bg-white/20 text-white rounded-full">
                  +{recording.tags.length - 2}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Clock size={12} className="text-white" />
              <span className="text-white text-sm font-medium">
                {formatDuration(recording.audioMetadata?.duration)}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className={cn(
                'w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 shadow-xl',
                isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-80',
                isCurrentRecording && isPlaying && 'animate-pulse'
              )}
            >
              {isCurrentRecording && isPlaying ? (
                <Pause size={28} className="text-forest-600 ml-1" />
              ) : (
                <Play size={28} className="text-forest-600 ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-100 font-display truncate">
              {recording.title}
            </h3>
            <p className="text-sm text-earth-500 dark:text-earth-400 mt-1 line-clamp-2">
              {recording.description}
            </p>
          </div>
          {recording.qualityAssessment && (
            <div className="flex flex-col items-end gap-1">
              {renderStars(recording.qualityAssessment.overallRating)}
              <span className="text-xs text-earth-400">
                SNR: {recording.qualityAssessment.signalToNoise}dB
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400">
            <MapPin size={14} className="text-forest-500" />
            <span className="truncate">{recording.locationName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400">
            <Calendar size={14} className="text-forest-500" />
            <span className="truncate">{getRelativeTime(recording.recordTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400">
            <span className="text-forest-500">{getWeatherIcon(recording.weather)}</span>
            <span>{weatherInfo.label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400">
            <Mic size={14} className="text-forest-500" />
            <span className="truncate">{recordingTypeInfo.label}</span>
          </div>
        </div>

        {recording.qualityAssessment?.hasUnwantedNoise && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-sunset-50 dark:bg-sunset-900/20 rounded-lg">
            <AlertTriangle size={14} className="text-sunset-500 flex-shrink-0" />
            <span className="text-xs text-sunset-700 dark:text-sunset-400">
              注意：{recording.qualityAssessment.noiseType || '包含意外干扰音'}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 py-4 border-t border-earth-100 dark:border-forest-800 flex items-center justify-between">
        <span className="text-xs text-earth-400">
          {formatDateTime(recording.recordTime)}
        </span>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              编辑
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              删除
            </Button>
          )}
        </div>
      </CardFooter>

      <audio
        ref={audioRef}
        src={recording.audioUrl}
        preload="metadata"
      />
    </Card>
  );
};
