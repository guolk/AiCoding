import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { Joke, JokeVersion, MaterialCategory } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedJokes, seedJokeVersions } from '../data/seedData';
import { generateId } from '../utils/duration';

interface JokeContextType {
  jokes: Joke[];
  jokeVersions: JokeVersion[];
  addJoke: (joke: Omit<Joke, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateJoke: (id: string, updates: Partial<Joke>, changeReason?: string) => void;
  deleteJoke: (id: string) => void;
  getJokeById: (id: string) => Joke | undefined;
  getJokesByCategory: (category: MaterialCategory) => Joke[];
  getJokeVersions: (jokeId: string) => JokeVersion[];
  getLatestVersion: (jokeId: string) => JokeVersion | undefined;
}

const JokeContext = createContext<JokeContextType | undefined>(undefined);

export function JokeProvider({ children }: { children: ReactNode }) {
  const [jokes, setJokes] = useLocalStorage<Joke[]>('comedy_jokes', seedJokes);
  const [jokeVersions, setJokeVersions] = useLocalStorage<JokeVersion[]>('comedy_joke_versions', seedJokeVersions);

  const addJoke = useCallback((joke: Omit<Joke, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newId = generateId();
    const newJoke: Joke = {
      ...joke,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setJokes(prev => [newJoke, ...prev]);
    
    const initialVersion: JokeVersion = {
      id: generateId(),
      jokeId: newId,
      versionNumber: 1,
      setup: joke.setup,
      punchline: joke.punchline,
      tag: joke.tag,
      changeReason: '初始版本',
      createdAt: now,
    };
    setJokeVersions(prev => [...prev, initialVersion]);
    
    return newId;
  }, [setJokes, setJokeVersions]);

  const updateJoke = useCallback((id: string, updates: Partial<Joke>, changeReason?: string) => {
    const now = new Date().toISOString();
    const existingJoke = jokes.find(j => j.id === id);
    if (!existingJoke) return;

    const updatedJoke = {
      ...existingJoke,
      ...updates,
      updatedAt: now,
    };
    setJokes(prev => prev.map(j => j.id === id ? updatedJoke : j));

    if (changeReason && (updates.setup !== undefined || updates.punchline !== undefined || updates.tag !== undefined)) {
      const currentVersions = jokeVersions.filter(v => v.jokeId === id);
      const nextVersionNumber = currentVersions.length > 0 
        ? Math.max(...currentVersions.map(v => v.versionNumber)) + 1 
        : 1;

      const newVersion: JokeVersion = {
        id: generateId(),
        jokeId: id,
        versionNumber: nextVersionNumber,
        setup: updatedJoke.setup,
        punchline: updatedJoke.punchline,
        tag: updatedJoke.tag,
        changeReason,
        createdAt: now,
      };
      setJokeVersions(prev => [...prev, newVersion]);
    }
  }, [jokes, jokeVersions, setJokes, setJokeVersions]);

  const deleteJoke = useCallback((id: string) => {
    setJokes(prev => prev.filter(j => j.id !== id));
    setJokeVersions(prev => prev.filter(v => v.jokeId !== id));
  }, [setJokes, setJokeVersions]);

  const getJokeById = useCallback((id: string) => {
    return jokes.find(j => j.id === id);
  }, [jokes]);

  const getJokesByCategory = useCallback((category: MaterialCategory) => {
    return jokes.filter(j => j.category === category);
  }, [jokes]);

  const getJokeVersions = useCallback((jokeId: string) => {
    return jokeVersions.filter(v => v.jokeId === jokeId).sort((a, b) => b.versionNumber - a.versionNumber);
  }, [jokeVersions]);

  const getLatestVersion = useCallback((jokeId: string) => {
    const versions = getJokeVersions(jokeId);
    return versions[versions.length - 1];
  }, [getJokeVersions]);

  return (
    <JokeContext.Provider value={{
      jokes,
      jokeVersions,
      addJoke,
      updateJoke,
      deleteJoke,
      getJokeById,
      getJokesByCategory,
      getJokeVersions,
      getLatestVersion,
    }}>
      {children}
    </JokeContext.Provider>
  );
}

export function useJokes() {
  const context = useContext(JokeContext);
  if (context === undefined) {
    throw new Error('useJokes must be used within a JokeProvider');
  }
  return context;
}
