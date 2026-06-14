import React, { useRef, useEffect, useState, useCallback } from 'react';
import { generateSpectrogramData, getFrequencyColor } from '@/utils/audio';
import { cn } from '@/lib/utils';
import { Loader2, ZoomIn, ZoomOut, Download, Info } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';

interface SpectrogramProps {
  audioUrl?: string;
  audioBuffer?: AudioBuffer | null;
  data?: number[][];
  height?: number;
  fftSize?: number;
  overlap?: number;
  sampleRate?: number;
  showControls?: boolean;
  showInfo?: boolean;
  className?: string;
}

export const Spectrogram: React.FC<SpectrogramProps> = ({
  audioUrl,
  audioBuffer: externalBuffer,
  height = 300,
  fftSize = 2048,
  overlap = 0.5,
  showControls = true,
  showInfo = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalBuffer, setInternalBuffer] = useState<AudioBuffer | null>(null);
  const [spectrogramData, setSpectrogramData] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const buffer = externalBuffer || internalBuffer;

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
    if (!buffer) return;

    setIsGenerating(true);
    try {
      const data = generateSpectrogramData(buffer, fftSize, overlap);
      setSpectrogramData(data);
    } catch (error) {
      console.error('Failed to generate spectrogram:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [buffer, fftSize, overlap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || spectrogramData.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    canvas.width = displayWidth * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const numFrames = spectrogramData.length;
    const numBins = spectrogramData[0].length;
    const visibleFrames = Math.floor(numFrames / zoom);
    const startFrame = Math.floor(offset * (numFrames - visibleFrames));

    let minDb = Infinity;
    let maxDb = -Infinity;
    for (let i = startFrame; i < startFrame + visibleFrames && i < numFrames; i++) {
      for (let j = 0; j < numBins; j++) {
        minDb = Math.min(minDb, spectrogramData[i][j]);
        maxDb = Math.max(maxDb, spectrogramData[i][j]);
      }
    }

    const frameWidth = displayWidth / visibleFrames;
    const binHeight = height / numBins;

    ctx.clearRect(0, 0, displayWidth, height);

    for (let i = 0; i < visibleFrames; i++) {
      const frameIndex = startFrame + i;
      if (frameIndex >= numFrames) break;

      for (let j = 0; j < numBins; j++) {
        const y = height - (j + 1) * binHeight;
        const value = spectrogramData[frameIndex][j];
        ctx.fillStyle = getFrequencyColor(value, minDb, maxDb);
        ctx.fillRect(i * frameWidth, y, frameWidth + 1, binHeight + 1);
      }
    }
  }, [spectrogramData, height, zoom, offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverPos(null);
  }, []);

  const getFrequencyAtY = (y: number): number => {
    const maxFreq = buffer?.sampleRate ? buffer.sampleRate / 2 : 22050;
    const normalizedY = 1 - y / height;
    return normalizedY * maxFreq;
  };

  const getTimeAtX = (x: number): number => {
    if (!buffer) return 0;
    const numFrames = spectrogramData.length;
    const visibleFrames = Math.floor(numFrames / zoom);
    const startFrame = Math.floor(offset * (numFrames - visibleFrames));
    const frameIndex = startFrame + (x / (containerRef.current?.clientWidth || 1)) * visibleFrames;
    const hopSize = fftSize * (1 - overlap);
    return (frameIndex * hopSize) / (buffer.sampleRate || 44100);
  };

  const downloadSpectrogram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'spectrogram.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (isGenerating) {
    return (
      <div 
        className={cn('flex items-center justify-center bg-earth-50 dark:bg-forest-900/50 rounded-lg', className)}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
          <p className="text-sm text-earth-500 dark:text-earth-400">生成频谱图中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <IconButton
            variant="filled"
            size="sm"
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Info size={16} />
          </IconButton>
          <IconButton
            variant="filled"
            size="sm"
            onClick={() => setZoom(Math.min(zoom * 1.5, 10))}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <ZoomIn size={16} />
          </IconButton>
          <IconButton
            variant="filled"
            size="sm"
            onClick={() => setZoom(Math.max(zoom / 1.5, 1))}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <ZoomOut size={16} />
          </IconButton>
          <IconButton
            variant="filled"
            size="sm"
            onClick={downloadSpectrogram}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Download size={16} />
          </IconButton>
        </div>
      )}

      {showInfoPanel && (
        <div className="absolute top-12 right-2 z-10 bg-black/80 text-white p-4 rounded-lg text-sm max-w-xs">
          <h4 className="font-semibold mb-2">频谱图说明</h4>
          <ul className="space-y-1 text-xs">
            <li>• 横轴：时间（秒）</li>
            <li>• 纵轴：频率（Hz）</li>
            <li>• 颜色：能量强度（蓝→红，从弱到强）</li>
            <li>• FFT大小：{fftSize}</li>
            <li>• 重叠率：{overlap * 100}%</li>
            {buffer && <li>• 采样率：{buffer.sampleRate} Hz</li>}
          </ul>
        </div>
      )}

      {zoom > 1 && (
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={offset}
            onChange={(e) => setOffset(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height }}
        />

        {hoverPos && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute w-px bg-white/50"
              style={{ left: hoverPos.x, top: 0, height: '100%' }}
            />
            <div
              className="absolute h-px bg-white/50"
              style={{ left: 0, top: hoverPos.y, width: '100%' }}
            />
            <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {getTimeAtX(hoverPos.x).toFixed(2)}s • {getFrequencyAtY(hoverPos.y).toFixed(0)}Hz
            </div>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="flex justify-between text-xs text-earth-500 dark:text-earth-400 mt-2 px-1">
          <span>0s</span>
          <span>频率</span>
          <span>{buffer ? (buffer.length / buffer.sampleRate).toFixed(1) + 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

interface FrequencyBarProps {
  frequencyData: Uint8Array;
  height?: number;
  barCount?: number;
  className?: string;
}

export const FrequencyBars: React.FC<FrequencyBarProps> = ({
  frequencyData,
  height = 60,
  barCount = 64,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frequencyData.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const displayWidth = rect.width;
    const barWidth = displayWidth / barCount;
    const gap = 2;
    const barDisplayWidth = barWidth - gap;

    const step = Math.floor(frequencyData.length / barCount);

    ctx.clearRect(0, 0, displayWidth, height);

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += frequencyData[i * step + j] || 0;
      }
      const average = sum / step;
      const normalizedValue = average / 255;
      const barHeight = normalizedValue * height * 0.9 + 2;
      const x = i * barWidth;
      const y = height - barHeight;

      const hue = (1 - normalizedValue) * 240;
      ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
      ctx.beginPath();
      ctx.roundRect(x, y, barDisplayWidth, barHeight, 2);
      ctx.fill();
    }
  }, [frequencyData, height, barCount]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full', className)}
      style={{ height }}
    />
  );
};
