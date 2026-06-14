import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useWaveform } from '@/hooks/useWaveform';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/audio';
import { Loader2 } from 'lucide-react';

interface WaveformProps {
  audioUrl?: string;
  audioBuffer?: AudioBuffer | null;
  data?: number[];
  height?: number;
  color?: string;
  progressColor?: string;
  progress?: number;
  isPlaying?: boolean;
  showTime?: boolean;
  showCursor?: boolean;
  duration?: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  audioUrl,
  audioBuffer: externalBuffer,
  height = 80,
  color = '#1a4d2e',
  progressColor = '#348052',
  progress = 0,
  showTime = false,
  duration: externalDuration,
  currentTime: externalCurrentTime,
  onSeek,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { waveformData, isGenerating, generate, drawWaveform, loadFromUrl } = useWaveform('', { samples: 500, autoLoad: false });
  const [internalBuffer, setInternalBuffer] = useState<AudioBuffer | null>(null);
  const [internalProgress, setInternalProgress] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const buffer = externalBuffer || internalBuffer;
  const currentProgress = externalCurrentTime !== undefined && externalDuration
    ? (externalCurrentTime / externalDuration) * 100
    : progress;

  useEffect(() => {
    if (buffer) {
      generate(buffer);
    }
  }, [buffer, generate]);

  useEffect(() => {
    if (!audioUrl || externalBuffer) return;

    const loadAudio = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setInternalBuffer(decodedBuffer);
      } catch (error) {
        console.error('Failed to load audio:', error);
      }
    };

    loadAudio();
  }, [audioUrl, externalBuffer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    drawWaveform(canvas, waveformData, {
      color,
      progressColor,
      progress: currentProgress,
      height,
    });
  }, [waveformData, currentProgress, color, progressColor, height, drawWaveform]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !externalDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * externalDuration;
    onSeek(time);
    setInternalProgress(percent * 100);
  }, [onSeek, externalDuration]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!externalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setHoverTime(percent * externalDuration);
  }, [externalDuration]);

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  if (isGenerating) {
    return (
      <div 
        className={cn('flex items-center justify-center bg-earth-50 dark:bg-forest-900/50 rounded-lg', className)}
        style={{ height }}
      >
        <Loader2 className="w-6 h-6 animate-spin text-forest-600" />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className={cn(
          'relative rounded-lg overflow-hidden cursor-pointer',
          onSeek && 'hover:bg-earth-50 dark:hover:bg-forest-900/30 transition-colors'
        )}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height }}
        />
        
        {hoverTime !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 bg-white/80 pointer-events-none"
            style={{
              left: `${(hoverTime / (externalDuration || 1)) * 100}%`,
              height: '80%',
            }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-earth-900 text-white text-xs rounded whitespace-nowrap">
              {formatDuration(hoverTime)}
            </div>
          </div>
        )}
      </div>

      {showTime && externalDuration !== undefined && (
        <div className="flex justify-between text-xs text-earth-500 dark:text-earth-400 mt-1 px-1">
          <span>{formatDuration(externalCurrentTime || 0)}</span>
          <span>{formatDuration(externalDuration)}</span>
        </div>
      )}
    </div>
  );
};

interface MiniWaveformProps {
  audioBuffer?: AudioBuffer | null;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const MiniWaveform: React.FC<MiniWaveformProps> = ({
  audioBuffer,
  width = 200,
  height = 32,
  color = '#1a4d2e',
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<string>('');

  useEffect(() => {
    if (!audioBuffer) {
      setImageData('');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / width);
    const bars: number[] = [];

    for (let i = 0; i < width; i++) {
      let max = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        const sample = Math.abs(channelData[start + j] || 0);
        if (sample > max) max = sample;
      }
      bars.push(max);
    }

    const maxBar = Math.max(...bars, 0.01);
    const centerY = height / 2;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color);

    ctx.globalAlpha = 0.6;
    bars.forEach((bar, i) => {
      const normalizedHeight = (bar / maxBar) * height * 0.7;
      const x = i;
      const y = centerY - normalizedHeight / 2;

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, 1, normalizedHeight);
    });

    setImageData(canvas.toDataURL());
  }, [audioBuffer, width, height, color]);

  if (!imageData) {
    return (
      <div 
        className={cn('bg-earth-100 dark:bg-forest-800/50 rounded', className)}
        style={{ width, height }}
      />
    );
  }

  return (
    <img
      src={imageData}
      alt="waveform"
      className={cn('rounded', className)}
      style={{ width, height }}
    />
  );
};
