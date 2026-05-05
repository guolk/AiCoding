import { useState, useRef, useCallback, useEffect } from 'react';
import type { PitchDetectionResult } from '@/types';
import { frequencyToNote } from '@/utils/music';

interface UsePitchDetectionOptions {
  bufferSize?: number;
  sampleRate?: number;
  minFrequency?: number;
  maxFrequency?: number;
  tolerance?: number;
}

export function usePitchDetection(options: UsePitchDetectionOptions = {}) {
  const {
    bufferSize = 2048,
    sampleRate = 44100,
    minFrequency = 60,
    maxFrequency = 4000,
    tolerance = 5,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<PitchDetectionResult | null>(null);
  const [pitchHistory, setPitchHistory] = useState<PitchDetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const autoCorrelate = useCallback((buffer: Float32Array, sampleRate: number): number => {
    let SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    const c = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;

    if (T0 === 0) return -1;

    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }, []);

  const processAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const buffer = new Float32Array(bufferSize);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = autoCorrelate(buffer, sampleRate);

    if (frequency >= minFrequency && frequency <= maxFrequency) {
      const noteData = frequencyToNote(frequency);
      const isInTune = Math.abs(noteData.deviation) < tolerance / 100;

      const result: PitchDetectionResult = {
        frequency,
        note: noteData.pitch,
        octave: noteData.octave,
        deviation: noteData.deviation,
        isInTune,
        timestamp: Date.now(),
      };

      setCurrentPitch(result);
      setPitchHistory(prev => {
        const updated = [...prev, result];
        if (updated.length > 100) {
          return updated.slice(-100);
        }
        return updated;
      });
    } else {
      setCurrentPitch(null);
    }

    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(processAudio);
    }
  }, [bufferSize, sampleRate, minFrequency, maxFrequency, tolerance, autoCorrelate, isListening]);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate,
        });
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = bufferSize * 2;

      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      processAudio();
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法访问麦克风';
      setError(message);
      console.error('Pitch detection error:', err);
    }
  }, [bufferSize, sampleRate, processAudio]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setCurrentPitch(null);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setPitchHistory([]);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    currentPitch,
    pitchHistory,
    error,
    startListening,
    stopListening,
    clearHistory,
  };
}
