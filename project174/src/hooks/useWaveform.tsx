import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { generateWaveformData } from '@/utils/audio';

interface UseWaveformOptions {
  samples?: number;
  autoLoad?: boolean;
}

interface UseWaveformReturn {
  waveformData: number[];
  isGenerating: boolean;
  progress: number;
  MiniWaveform: React.FC<{
    isPlaying?: boolean;
    color?: string;
    height?: number;
    className?: string;
  }>;
  generate: (audioBuffer: AudioBuffer) => void;
  loadFromUrl: (url: string) => Promise<void>;
  drawWaveform: (
    canvas: HTMLCanvasElement,
    data: number[],
    options?: {
      color?: string;
      backgroundColor?: string;
      progress?: number;
      progressColor?: string;
      height?: number;
    }
  ) => void;
  clear: () => void;
}

export const useWaveform = (
  audioUrl: string = '',
  options: UseWaveformOptions = {}
): UseWaveformReturn => {
  const { samples = 1000, autoLoad = true } = options;

  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const loadFromUrl = useCallback(
    async (url: string) => {
      if (!url) return;

      setIsGenerating(true);
      setProgress(0);

      try {
        const audioContext = initAudioContext();
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);

        setAudioBuffer(buffer);

        const data = generateWaveformData(buffer, samples);
        setWaveformData(data);
        setProgress(100);
      } catch (error) {
        console.error('加载音频失败:', error);
        const mockData = Array.from({ length: samples }, () => Math.random() * 0.5 + 0.2);
        setWaveformData(mockData);
        setProgress(100);
      } finally {
        setIsGenerating(false);
      }
    },
    [samples, initAudioContext]
  );

  const generate = useCallback(
    (buffer: AudioBuffer) => {
      if (!buffer) return;

      setIsGenerating(true);
      setProgress(0);

      try {
        setAudioBuffer(buffer);
        const data = generateWaveformData(buffer, samples);
        setWaveformData(data);
        setProgress(100);
      } catch (error) {
        console.error('生成波形失败:', error);
      } finally {
        setIsGenerating(false);
      }
    },
    [samples]
  );

  const drawWaveform = useCallback(
    (
      canvas: HTMLCanvasElement,
      data: number[],
      drawOptions: {
        color?: string;
        backgroundColor?: string;
        progress?: number;
        progressColor?: string;
        height?: number;
      } = {}
    ) => {
      const {
        color = '#1a4d2e',
        backgroundColor = 'transparent',
        progress = 0,
        progressColor = '#348052',
        height: canvasHeight,
      } = drawOptions;

      const ctx = canvas.getContext('2d');
      if (!ctx || data.length === 0) return;

      const width = canvas.width;
      const height = canvasHeight || canvas.height;
      const centerY = height / 2;
      const barWidth = width / data.length;
      const progressX = width * (progress / 100);

      ctx.clearRect(0, 0, width, height);

      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      const maxValue = Math.max(...data, 0.01);
      const normalizedData = data.map((v) => v / maxValue);

      normalizedData.forEach((value, i) => {
        const x = i * barWidth;
        const barHeight = value * height * 0.8;
        const y = centerY - barHeight / 2;

        ctx.fillStyle = x < progressX ? progressColor : color;
        ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
      });
    },
    []
  );

  const clear = useCallback(() => {
    setWaveformData([]);
    setProgress(0);
    setIsGenerating(false);
    setAudioBuffer(null);
  }, []);

  useEffect(() => {
    if (autoLoad && audioUrl) {
      loadFromUrl(audioUrl);
    }
  }, [audioUrl, autoLoad, loadFromUrl]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const MiniWaveform: React.FC<{
    isPlaying?: boolean;
    color?: string;
    height?: number;
    className?: string;
  }> = useMemo(() => {
    return ({
      isPlaying = false,
      color = '#22c55e',
      height = 32,
      className = '',
    }) => {
      const animationRef = useRef<number>();
      const canvasRef = useRef<HTMLCanvasElement>(null);
      const [phase, setPhase] = useState(0);

      useEffect(() => {
        if (!isPlaying) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          setPhase(0);
          return;
        }

        const animate = () => {
          setPhase((p) => (p + 1) % 100);
          animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }, [isPlaying]);

      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || waveformData.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const barCount = Math.min(waveformData.length, width);
        const barWidth = width / barCount;
        const centerY = height / 2;
        const maxValue = Math.max(...waveformData, 0.01);

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * waveformData.length);
          const value = waveformData[dataIndex] || 0;
          const normalizedHeight = (value / maxValue) * height * 0.8;

          let animationScale = 1;
          if (isPlaying) {
            const wave = Math.sin((i / barCount) * Math.PI * 4 + phase * 0.1);
            animationScale = 0.8 + wave * 0.2;
          }

          const barHeight = Math.max(2, normalizedHeight * animationScale);
          const x = i * barWidth;
          const y = centerY - barHeight / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, color + 'aa');
          gradient.addColorStop(1, color);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
        }
      }, [waveformData, color, height, isPlaying, phase]);

      return (
        <canvas
          ref={canvasRef}
          width={500}
          height={height}
          className={className}
          style={{ width: '100%', height }}
        />
      );
    };
  }, [waveformData]);

  return {
    waveformData,
    isGenerating,
    progress,
    MiniWaveform,
    generate,
    loadFromUrl,
    drawWaveform,
    clear,
  };
};

export const useMiniWaveform = (
  audioBuffer: AudioBuffer | null,
  width: number = 200,
  height: number = 40
) => {
  const [waveformImage, setWaveformImage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!audioBuffer) {
      setWaveformImage('');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvasRef.current = canvas;

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
    gradient.addColorStop(0, '#348052');
    gradient.addColorStop(0.5, '#1a4d2e');
    gradient.addColorStop(1, '#348052');

    bars.forEach((bar, i) => {
      const normalizedHeight = (bar / maxBar) * height * 0.8;
      const x = i;
      const y = centerY - normalizedHeight / 2;

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, 1, normalizedHeight);
    });

    setWaveformImage(canvas.toDataURL());
  }, [audioBuffer, width, height]);

  return waveformImage;
};
