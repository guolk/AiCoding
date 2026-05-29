import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat } from 'lucide-react';
import { formatTime } from '../utils';

interface AudioPlayerProps {
  duration?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  currentSegment?: { startTime: number; endTime: number } | null;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
}

const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  duration = 60,
  onPlay,
  onPause,
  onTimeUpdate,
  currentSegment,
  playbackRate = 1.0,
  onPlaybackRateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          let newTime = prev + 0.1;
          
          if (currentSegment) {
            if (newTime >= currentSegment.endTime) {
              if (isLooping) {
                newTime = currentSegment.startTime;
              } else {
                setIsPlaying(false);
                newTime = currentSegment.endTime;
              }
            }
          } else if (newTime >= duration) {
            if (isLooping) {
              newTime = 0;
            } else {
              setIsPlaying(false);
              newTime = duration;
            }
          }
          
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration, currentSegment, isLooping, onTimeUpdate]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      onPause?.();
    } else {
      if (currentSegment && currentTime >= currentSegment.endTime) {
        setCurrentTime(currentSegment.startTime);
      } else if (!currentSegment && currentTime >= duration) {
        setCurrentTime(0);
      }
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const skipBack = () => {
    if (currentSegment) {
      setCurrentTime(currentSegment.startTime);
    } else {
      setCurrentTime(Math.max(0, currentTime - 5));
    }
    onTimeUpdate?.(currentSegment?.startTime || Math.max(0, currentTime - 5));
  };

  const skipForward = () => {
    if (currentSegment) {
      setCurrentTime(currentSegment.endTime);
    } else {
      setCurrentTime(Math.min(duration, currentTime + 5));
    }
    onTimeUpdate?.(currentSegment?.endTime || Math.min(duration, currentTime + 5));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    let newTime;
    if (currentSegment) {
      const segmentDuration = currentSegment.endTime - currentSegment.startTime;
      newTime = currentSegment.startTime + (percentage * segmentDuration);
      newTime = Math.max(currentSegment.startTime, Math.min(currentSegment.endTime, newTime));
    } else {
      newTime = percentage * duration;
      newTime = Math.max(0, Math.min(duration, newTime));
    }
    
    setCurrentTime(newTime);
    onTimeUpdate?.(newTime);
  };

  const displayTime = currentSegment 
    ? currentTime - currentSegment.startTime
    : currentTime;
  const displayDuration = currentSegment
    ? currentSegment.endTime - currentSegment.startTime
    : duration;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <div 
          className="h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-gradient-to-r from-[#1E3A5F] to-[#F59E0B] rounded-full transition-all duration-100"
            style={{ width: `${displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{formatTime(displayTime)}</span>
          <span>{formatTime(displayDuration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={skipBack}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SkipBack className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-gradient-to-r from-[#1E3A5F] to-[#2d4f7a] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
          <button
            onClick={skipForward}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange?.(parseFloat(e.target.value))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
          >
            {playbackRates.map(rate => (
              <option key={rate} value={rate}>{rate}x</option>
            ))}
          </select>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-full transition-colors ${isLooping ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Repeat className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
