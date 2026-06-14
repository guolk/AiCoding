import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  X,
  GripHorizontal,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { formatDuration } from '@/utils/audio';
import { IconButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Tag } from '@/components/ui/Tag';
import { Link } from 'react-router-dom';

export const AudioPlayerBar: React.FC = () => {
  const {
    currentRecording,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    queue,
    isShuffled,
    repeatMode,
    togglePlay,
    setCurrentTime,
    setVolume,
    toggleMute,
    setPlaybackRate,
    next,
    previous,
    toggleShuffle,
    setRepeatMode,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [showQueue, setShowQueue] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentRecording?.audioUrl) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentRecording?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }, [setCurrentTime]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    } else {
      next();
    }
  }, [repeatMode, next]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progress = progressRef.current;
    if (!progress || !audioRef.current) return;

    const rect = progress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentRecording) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-forest-950/90 backdrop-blur-xl border-t border-earth-100 dark:border-forest-800 z-40 flex items-center justify-center">
        <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-2">
          <ListMusic size={18} />
          选择一段录音开始播放
        </p>
      </div>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={currentRecording.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => {
          const audio = e.target as HTMLAudioElement;
          usePlayerStore.getState().setDuration(audio.duration);
        }}
      />

      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-forest-950/95 backdrop-blur-xl border-t border-earth-100 dark:border-forest-800 z-40 transition-all duration-300',
          isExpanded ? 'h-80' : 'h-20'
        )}
      >
        {isExpanded && (
          <div className="absolute top-4 right-4 z-10">
            <IconButton onClick={() => setIsExpanded(false)}>
              <X size={20} />
            </IconButton>
          </div>
        )}

        <div className="h-full flex flex-col">
          {isExpanded && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-bold text-earth-900 dark:text-earth-100 font-display mb-2">
                  {currentRecording.title}
                </h2>
                <p className="text-earth-600 dark:text-earth-400 mb-4">
                  {currentRecording.locationName} • {formatDate(currentRecording.recordTime)}
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {currentRecording.tags.slice(0, 5).map(tag => (
                    <Tag key={tag.id} tag={tag} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div
            ref={progressRef}
            className="h-1 bg-earth-100 dark:bg-forest-800 cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-forest-500 to-forest-600 relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-forest-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4 px-4 md:px-6">
            <div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-white shrink-0">
                <div className="flex items-end gap-0.5 h-5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      style={{
                        height: `${20 + Math.random() * 80}%`,
                        animation: isPlaying ? `wave 0.5s ease-in-out ${i * 0.1}s infinite` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="min-w-0 hidden sm:block">
                <Link 
                  to={`/archive/${currentRecording.id}`}
                  className="text-sm font-medium text-earth-900 dark:text-earth-100 hover:text-forest-600 dark:hover:text-forest-400 truncate block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentRecording.title}
                </Link>
                <p className="text-xs text-earth-500 dark:text-earth-400 truncate">
                  {currentRecording.locationName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconButton 
                onClick={previous}
                size="sm"
                className="hidden sm:inline-flex"
              >
                <SkipBack size={18} />
              </IconButton>

              <IconButton
                onClick={togglePlay}
                variant="filled"
                size="lg"
                className="w-12 h-12"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </IconButton>

              <IconButton 
                onClick={next}
                size="sm"
                className="hidden sm:inline-flex"
              >
                <SkipForward size={18} />
              </IconButton>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-earth-500 dark:text-earth-400 w-24 justify-center">
              <span>{formatDuration(currentTime)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <IconButton
                onClick={toggleShuffle}
                size="sm"
                className={isShuffled ? 'text-forest-600 dark:text-forest-400' : ''}
              >
                <Shuffle size={18} />
              </IconButton>

              <IconButton
                onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                size="sm"
                className={repeatMode !== 'none' ? 'text-forest-600 dark:text-forest-400' : ''}
              >
                {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
              </IconButton>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <IconButton onClick={toggleMute} size="sm">
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </IconButton>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-earth-200 dark:bg-forest-700 rounded-full appearance-none cursor-pointer accent-forest-600"
              />
            </div>

            <IconButton
              onClick={() => setShowQueue(!showQueue)}
              size="sm"
              className={cn(showQueue && 'text-forest-600 dark:text-forest-400')}
            >
              <ListMusic size={18} />
            </IconButton>

            <button
              className="lg:hidden p-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <GripHorizontal size={20} className="text-earth-400" />
            </button>
          </div>
        </div>
      </div>

      {showQueue && (
        <div className="fixed bottom-20 right-4 w-80 max-h-96 bg-white dark:bg-forest-900 rounded-xl shadow-2xl border border-earth-100 dark:border-forest-700 z-50 overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-earth-100 dark:border-forest-700 flex items-center justify-between">
            <h3 className="font-semibold text-earth-900 dark:text-earth-100">播放队列</h3>
            <span className="text-sm text-earth-500 dark:text-earth-400">
              {queue.length} 首
            </span>
          </div>
          <div className="overflow-y-auto max-h-72">
            {queue.map((recording, index) => (
              <div
                key={recording.id}
                className={cn(
                  'flex items-center gap-3 p-3 border-b border-earth-50 dark:border-forest-800/50 cursor-pointer transition-colors',
                  recording.id === currentRecording?.id
                    ? 'bg-forest-50 dark:bg-forest-800/30'
                    : 'hover:bg-earth-50 dark:hover:bg-forest-800/20'
                )}
                onClick={() => {
                  usePlayerStore.getState().setCurrentRecording(recording);
                  usePlayerStore.getState().setCurrentTime(0);
                  usePlayerStore.getState().play();
                }}
              >
                <span className="text-sm text-earth-400 w-6 text-center">
                  {index + 1}
                </span>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-white text-xs shrink-0">
                  {formatDuration(recording.audioMetadata?.duration || 0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-earth-900 dark:text-earth-100 truncate">
                    {recording.title}
                  </p>
                  <p className="text-xs text-earth-500 dark:text-earth-400 truncate">
                    {recording.locationName}
                  </p>
                </div>
                {recording.id === currentRecording?.id && isPlaying && (
                  <div className="flex items-end gap-0.5 h-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-forest-600 rounded-full"
                        style={{
                          height: '100%',
                          animation: `wave 0.5s ease-in-out ${i * 0.1}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};
