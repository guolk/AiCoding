import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReplayGame, Annotation } from '../types';

interface GameState {
  currentGame: ReplayGame | null;
  currentMoveIndex: number;
  annotations: Annotation[];
  isPlaying: boolean;
}

interface GameActions {
  loadPGN: (game: ReplayGame) => void;
  goToMove: (index: number) => void;
  nextMove: () => void;
  prevMove: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeAnnotation: (id: string) => void;
}

export type GameStore = GameState & GameActions;

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      currentMoveIndex: 0,
      annotations: [],
      isPlaying: false,

      loadPGN: (game) => {
        set({
          currentGame: game,
          currentMoveIndex: 0,
          annotations: game.annotations,
          isPlaying: false,
        });
      },

      goToMove: (index) => {
        const { currentGame } = get();
        if (!currentGame) return;
        const maxIndex = Math.max(0, currentGame.moves.length - 1);
        const clampedIndex = Math.max(0, Math.min(index, maxIndex));
        set({ currentMoveIndex: clampedIndex });
      },

      nextMove: () => {
        const { currentGame, currentMoveIndex } = get();
        if (!currentGame) return;
        const maxIndex = Math.max(0, currentGame.moves.length - 1);
        if (currentMoveIndex < maxIndex) {
          set({ currentMoveIndex: currentMoveIndex + 1 });
        }
      },

      prevMove: () => {
        const { currentMoveIndex } = get();
        if (currentMoveIndex > 0) {
          set({ currentMoveIndex: currentMoveIndex - 1 });
        }
      },

      goToStart: () => {
        set({ currentMoveIndex: 0 });
      },

      goToEnd: () => {
        const { currentGame } = get();
        if (!currentGame) return;
        const maxIndex = Math.max(0, currentGame.moves.length - 1);
        set({ currentMoveIndex: maxIndex });
      },

      addAnnotation: (annotation) => {
        const now = new Date();
        const newAnnotation: Annotation = {
          ...annotation,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          annotations: [...state.annotations, newAnnotation],
        }));
      },

      removeAnnotation: (id) => {
        set((state) => ({
          annotations: state.annotations.filter((a) => a.id !== id),
        }));
      },
    }),
    {
      name: 'game-store',
      version: 1,
    }
  )
);
