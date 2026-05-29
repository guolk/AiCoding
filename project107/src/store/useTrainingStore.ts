import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WrongTactic, GameStatistics, OpeningStat, GameResult, PieceColor } from '../types';

interface TrainingState {
  wrongTactics: WrongTactic[];
  gameStatistics: GameStatistics;
  openingStats: OpeningStat[];
}

interface TrainingActions {
  addWrongTactic: (tactic: Omit<WrongTactic, 'id' | 'attemptedAt' | 'reviewCount' | 'masteryLevel'>) => void;
  removeWrongTactic: (id: string) => void;
  updateStatistics: (result: GameResult, color: PieceColor, openingId?: string, openingName?: string, eco?: string) => void;
}

export type TrainingStore = TrainingState & TrainingActions;

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const createEmptyStatistics = (): GameStatistics => {
  const now = new Date();
  return {
    id: generateId(),
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    asWhite: {
      total: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    },
    asBlack: {
      total: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    },
    winRate: 0,
    periodStart: now,
    periodEnd: now,
  };
};

const calculateWinRate = (wins: number, total: number): number => {
  return total > 0 ? Math.round((wins / total) * 10000) / 100 : 0;
};

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set) => ({
      wrongTactics: [],
      gameStatistics: createEmptyStatistics(),
      openingStats: [],

      addWrongTactic: (tactic) => {
        const newTactic: WrongTactic = {
          ...tactic,
          id: generateId(),
          attemptedAt: new Date(),
          reviewCount: 0,
          masteryLevel: 0,
        };
        set((state) => ({
          wrongTactics: [...state.wrongTactics, newTactic],
        }));
      },

      removeWrongTactic: (id) => {
        set((state) => ({
          wrongTactics: state.wrongTactics.filter((t) => t.id !== id),
        }));
      },

      updateStatistics: (result, color, openingId, openingName, eco) => {
        set((state) => {
          const stats = { ...state.gameStatistics };
          const colorStats = color === 'white' ? { ...stats.asWhite } : { ...stats.asBlack };

          stats.totalGames += 1;
          colorStats.total += 1;

          if (result === 'win') {
            stats.wins += 1;
            colorStats.wins += 1;
          } else if (result === 'loss') {
            stats.losses += 1;
            colorStats.losses += 1;
          } else {
            stats.draws += 1;
            colorStats.draws += 1;
          }

          stats.winRate = calculateWinRate(stats.wins, stats.totalGames);
          colorStats.winRate = calculateWinRate(colorStats.wins, colorStats.total);

          if (color === 'white') {
            stats.asWhite = colorStats;
          } else {
            stats.asBlack = colorStats;
          }

          stats.periodEnd = new Date();

          let openingStats = [...state.openingStats];
          if (openingId && openingName) {
            const existingIndex = openingStats.findIndex(
              (os) => os.openingId === openingId && os.color === color
            );

            if (existingIndex >= 0) {
              const existing = openingStats[existingIndex];
              const updated = {
                ...existing,
                totalGames: existing.totalGames + 1,
                lastPlayedAt: new Date(),
              };

              if (result === 'win') {
                updated.wins += 1;
              } else if (result === 'loss') {
                updated.losses += 1;
              } else {
                updated.draws += 1;
              }

              updated.winRate = calculateWinRate(updated.wins, updated.totalGames);
              openingStats[existingIndex] = updated;
            } else {
              openingStats.push({
                id: generateId(),
                openingId,
                openingName,
                eco: eco || '',
                color,
                totalGames: 1,
                wins: result === 'win' ? 1 : 0,
                losses: result === 'loss' ? 1 : 0,
                draws: result === 'draw' ? 1 : 0,
                winRate: result === 'win' ? 100 : 0,
                lastPlayedAt: new Date(),
              });
            }
          }

          return {
            gameStatistics: stats,
            openingStats,
          };
        });
      },
    }),
    {
      name: 'training-store',
      version: 1,
    }
  )
);
