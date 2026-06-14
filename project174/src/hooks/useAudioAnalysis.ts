import { useState, useEffect, useRef, useCallback } from 'react';
import { generateWaveformData, generateSpectrogramData, calculateSNR } from '@/utils/audio';

interface UseAudioAnalysisOptions {
  autoAnalyze?: boolean;
  fftSize?: number;
  overlap?: number;
  waveformSamples?: number;
}

interface UseAudioAnalysisReturn {
  audioBuffer: AudioBuffer | null;
  waveformData: number[];
  spectrogramData: number[][];
  snr: number | null;
  isLoading: boolean;
  error: string | null;
  analyze: (file: File | string) => Promise<void>;
  clear: () => void;
}

export const useAudioAnalysis = (options: UseAudioAnalysisOptions = {}): UseAudioAnalysisReturn => {
  const {
    autoAnalyze = false,
    fftSize = 2048,
    overlap = 0.5,
    waveformSamples = 1000,
  } = options;

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [spectrogramData, setSpectrogramData] = useState<number[][]>([]);
  const [snr, setSnr] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const loadAudioFile = useCallback(async (file: File | string): Promise<ArrayBuffer> => {
    abortControllerRef.current = new AbortController();

    if (typeof file === 'string') {
      const response = await fetch(file, {
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.arrayBuffer();
    } else {
      return file.arrayBuffer();
    }
  }, []);

  const analyze = useCallback(async (file: File | string) => {
    setIsLoading(true);
    setError(null);

    try {
      const audioContext = initAudioContext();
      const arrayBuffer = await loadAudioFile(file);
      const buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

      setAudioBuffer(buffer);

      const waveform = generateWaveformData(buffer, waveformSamples);
      setWaveformData(waveform);

      const spectrogram = generateSpectrogramData(buffer, fftSize, overlap);
      setSpectrogramData(spectrogram);

      const snrValue = calculateSNR(buffer);
      setSnr(snrValue);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || '分析音频时出错');
      }
    } finally {
      setIsLoading(false);
    }
  }, [initAudioContext, loadAudioFile, waveformSamples, fftSize, overlap]);

  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAudioBuffer(null);
    setWaveformData([]);
    setSpectrogramData([]);
    setSnr(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    audioBuffer,
    waveformData,
    spectrogramData,
    snr,
    isLoading,
    error,
    analyze,
    clear,
  };
};

export const useRealtimeSpectrum = (
  audioContext: AudioContext | null,
  analyser: AnalyserNode | null,
  enabled: boolean = true
) => {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array());
  const [timeData, setTimeData] = useState<Uint8Array>(new Uint8Array());
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!audioContext || !analyser || !enabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    analyser.fftSize = 2048;
    const frequencyArray = new Uint8Array(analyser.frequencyBinCount);
    const timeArray = new Uint8Array(analyser.fftSize);

    const update = () => {
      analyser.getByteFrequencyData(frequencyArray);
      analyser.getByteTimeDomainData(timeArray);

      setFrequencyData(new Uint8Array(frequencyArray));
      setTimeData(new Uint8Array(timeArray));

      animationRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioContext, analyser, enabled]);

  return { frequencyData, timeData };
};
