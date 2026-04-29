import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialTime = 0, autoStart = false) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const savedTimeRef = useRef(initialTime);

  const start = useCallback(() => {
    if (isRunning && !isPaused) return;
    
    if (isPaused) {
      startTimeRef.current = Date.now() - (savedTimeRef.current * 1000);
      setIsPaused(false);
    } else {
      startTimeRef.current = Date.now() - (time * 1000);
    }
    
    setIsRunning(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        savedTimeRef.current = elapsed;
        setTime(elapsed);
      }
    }, 1000);
  }, [isRunning, isPaused, time]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning, isPaused]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((newTime = 0) => {
    setTime(newTime);
    savedTimeRef.current = newTime;
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    time,
    formattedTime: formatTime(time),
    isRunning,
    isPaused,
    start,
    pause,
    stop,
    reset,
    toggle: isRunning && !isPaused ? pause : start
  };
}
