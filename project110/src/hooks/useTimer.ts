import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface TimerOptions {
  initialSeconds?: number;
  countUp?: boolean;
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (seconds: number) => void;
}

export const useTimer = (options: TimerOptions = {}) => {
  const {
    initialSeconds = 0,
    countUp = false,
    autoStart = false,
    onComplete,
    onTick,
  } = options;

  const [state, setState] = useState<TimerState>({
    seconds: initialSeconds,
    isRunning: autoStart,
    isPaused: false,
  });

  const intervalRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      let newSeconds: number;

      if (countUp) {
        newSeconds = prev.seconds + 1;
      } else {
        newSeconds = prev.seconds - 1;

        if (newSeconds <= 0) {
          onComplete?.();
          return {
            seconds: 0,
            isRunning: false,
            isPaused: false,
          };
        }
      }

      onTick?.(newSeconds);
      return { ...prev, seconds: newSeconds };
    });
  }, [countUp, onComplete, onTick]);

  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = window.setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, tick]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false, isPaused: false }));
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setState({
      seconds: newSeconds ?? initialSeconds,
      isRunning: false,
      isPaused: false,
    });
  }, [initialSeconds]);

  const setSeconds = useCallback((seconds: number) => {
    setState(prev => ({ ...prev, seconds }));
  }, []);

  return {
    seconds: state.seconds,
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    setSeconds,
    toggle: state.isRunning
      ? (state.isPaused ? resume : pause)
      : start,
  };
};

export default useTimer;
