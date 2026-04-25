import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAnimationOptions {
  duration: number;
  speed: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

interface UseAnimationReturn {
  progress: number;
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setProgress: (progress: number) => void;
  setSpeed: (speed: number) => void;
}

export function useAnimation(options: UseAnimationOptions): UseAnimationReturn {
  const { duration, speed: initialSpeed, onProgress, onComplete } = options;

  const [progress, setProgressState] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeedState] = useState(initialSpeed);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef(0);
  const durationRef = useRef(duration);
  const speedRef = useRef(initialSpeed);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const animate = useCallback((currentTime: number) => {
    if (!isPlayingRef.current || isPausedRef.current) {
      return;
    }

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
    }

    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    const progressIncrement = (deltaTime * speedRef.current) / durationRef.current;
    let newProgress = progressRef.current + progressIncrement;

    if (newProgress >= 1) {
      newProgress = 1;
      progressRef.current = 1;
      setProgressState(1);
      isPlayingRef.current = false;
      setIsPlaying(false);

      if (onProgressRef.current) {
        onProgressRef.current(1);
      }
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
      return;
    }

    progressRef.current = newProgress;
    setProgressState(newProgress);

    if (onProgressRef.current) {
      onProgressRef.current(newProgress);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, isPaused, animate]);

  const play = useCallback(() => {
    if (progressRef.current >= 1) {
      accumulatedTimeRef.current = 0;
      progressRef.current = 0;
      setProgressState(0);
    }

    lastTimeRef.current = 0;
    isPausedRef.current = false;
    isPlayingRef.current = true;
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    accumulatedTimeRef.current = 0;
    lastTimeRef.current = 0;
    progressRef.current = 0;
    isPlayingRef.current = false;
    isPausedRef.current = false;

    setProgressState(0);
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const setProgress = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, newProgress));
    progressRef.current = clampedProgress;
    setProgressState(clampedProgress);

    if (onProgressRef.current) {
      onProgressRef.current(clampedProgress);
    }
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    speedRef.current = newSpeed;
    setSpeedState(newSpeed);
  }, []);

  return {
    progress,
    isPlaying,
    isPaused,
    speed,
    play,
    pause,
    reset,
    setProgress,
    setSpeed
  };
}
