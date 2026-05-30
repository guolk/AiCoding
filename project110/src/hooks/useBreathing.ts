import { useState, useEffect, useCallback } from 'react';

interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale' | 'rest';
  duration: number;
}

interface BreathingCycle {
  phases: BreathingPhase[];
}

interface UseBreathingOptions {
  cycle: BreathingCycle;
  cyclesPerMinute?: number;
  onPhaseChange?: (phase: BreathingPhase) => void;
  onCycleComplete?: () => void;
}

export const useBreathing = (options: UseBreathingOptions) => {
  const { cycle, onPhaseChange, onCycleComplete } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);

  const currentPhase = cycle.phases[currentPhaseIndex];

  const advancePhase = useCallback(() => {
    const nextIndex = (currentPhaseIndex + 1) % cycle.phases.length;
    
    if (nextIndex === 0) {
      setCompletedCycles(prev => prev + 1);
      onCycleComplete?.();
    }

    setCurrentPhaseIndex(nextIndex);
    setPhaseProgress(0);
    onPhaseChange?.(cycle.phases[nextIndex]);
  }, [currentPhaseIndex, cycle.phases, onPhaseChange, onCycleComplete]);

  useEffect(() => {
    if (!isRunning) return;

    const phaseDuration = currentPhase.duration * 1000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / phaseDuration, 1);
      setPhaseProgress(progress);

      if (progress >= 1) {
        advancePhase();
      }
    };

    const interval = window.setInterval(updateProgress, 50);

    return () => clearInterval(interval);
  }, [isRunning, currentPhase, advancePhase]);

  const start = useCallback(() => {
    setIsRunning(true);
    onPhaseChange?.(currentPhase);
  }, [currentPhase, onPhaseChange]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setCompletedCycles(0);
  }, []);

  return {
    isRunning,
    currentPhase,
    phaseProgress,
    completedCycles,
    start,
    pause,
    reset,
  };
};

export default useBreathing;
