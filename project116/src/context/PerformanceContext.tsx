import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { Performance, OccasionType, JokeSlot } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedPerformances } from '../data/seedData';
import { generateId } from '../utils/duration';

interface PerformanceContextType {
  performances: Performance[];
  addPerformance: (performance: Omit<Performance, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePerformance: (id: string, updates: Partial<Performance>) => void;
  deletePerformance: (id: string) => void;
  getPerformanceById: (id: string) => Performance | undefined;
  getPerformancesByOccasion: (occasion: OccasionType) => Performance[];
  reorderJokeSlots: (performanceId: string, newSlots: JokeSlot[]) => void;
  addJokeToPerformance: (performanceId: string, jokeId: string) => void;
  removeJokeFromPerformance: (performanceId: string, slotId: string) => void;
  updateJokeSlot: (performanceId: string, slotId: string, updates: Partial<JokeSlot>) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [performances, setPerformances] = useLocalStorage<Performance[]>('comedy_performances', seedPerformances);

  const addPerformance = useCallback((performance: Omit<Performance, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newId = generateId();
    const newPerformance: Performance = {
      ...performance,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setPerformances(prev => [newPerformance, ...prev]);
    return newId;
  }, [setPerformances]);

  const updatePerformance = useCallback((id: string, updates: Partial<Performance>) => {
    setPerformances(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  }, [setPerformances]);

  const deletePerformance = useCallback((id: string) => {
    setPerformances(prev => prev.filter(p => p.id !== id));
  }, [setPerformances]);

  const getPerformanceById = useCallback((id: string) => {
    return performances.find(p => p.id === id);
  }, [performances]);

  const getPerformancesByOccasion = useCallback((occasion: OccasionType) => {
    return performances.filter(p => p.occasion === occasion);
  }, [performances]);

  const reorderJokeSlots = useCallback((performanceId: string, newSlots: JokeSlot[]) => {
    const reorderedSlots = newSlots.map((slot, index) => ({
      ...slot,
      order: index,
    }));
    setPerformances(prev =>
      prev.map(p =>
        p.id === performanceId
          ? { ...p, jokeSlots: reorderedSlots, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, [setPerformances]);

  const addJokeToPerformance = useCallback((performanceId: string, jokeId: string) => {
    setPerformances(prev =>
      prev.map(p => {
        if (p.id !== performanceId) return p;
        const newOrder = p.jokeSlots.length;
        const newSlot: JokeSlot = {
          id: generateId(),
          jokeId,
          order: newOrder,
        };
        return {
          ...p,
          jokeSlots: [...p.jokeSlots, newSlot],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [setPerformances]);

  const removeJokeFromPerformance = useCallback((performanceId: string, slotId: string) => {
    setPerformances(prev =>
      prev.map(p => {
        if (p.id !== performanceId) return p;
        const filteredSlots = p.jokeSlots
          .filter(s => s.id !== slotId)
          .map((s, i) => ({ ...s, order: i }));
        return {
          ...p,
          jokeSlots: filteredSlots,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [setPerformances]);

  const updateJokeSlot = useCallback((performanceId: string, slotId: string, updates: Partial<JokeSlot>) => {
    setPerformances(prev =>
      prev.map(p => {
        if (p.id !== performanceId) return p;
        return {
          ...p,
          jokeSlots: p.jokeSlots.map(s =>
            s.id === slotId ? { ...s, ...updates } : s
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [setPerformances]);

  return (
    <PerformanceContext.Provider value={{
      performances,
      addPerformance,
      updatePerformance,
      deletePerformance,
      getPerformanceById,
      getPerformancesByOccasion,
      reorderJokeSlots,
      addJokeToPerformance,
      removeJokeFromPerformance,
      updateJokeSlot,
    }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformances() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformances must be used within a PerformanceProvider');
  }
  return context;
}
