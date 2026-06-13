import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { GoStore, GameRecord, MoveMark, GameCategory } from '@/types';
import { mockGames, mockProblems, mockJosekis, mockDailyTasks, mockMatches, mockRanks } from '@/utils/mockData';
import { parseSGFToGameRecord } from '@/utils/sgfParser';

function updateNodeInTree(root: GameRecord['rootNode'], nodeId: string, updater: (node: GameRecord['rootNode']) => void): GameRecord['rootNode'] {
  const newRoot = JSON.parse(JSON.stringify(root));
  
  function findAndUpdate(node: GameRecord['rootNode']): boolean {
    if (node.id === nodeId) {
      updater(node);
      return true;
    }
    for (const child of node.children) {
      if (findAndUpdate(child)) {
        return true;
      }
    }
    return false;
  }
  
  findAndUpdate(newRoot);
  return newRoot;
}

const initialSettings = {
  boardSize: 19,
  autoPlaySpeed: 1000,
  showCoordinates: true,
  showMoveNumbers: false,
};

export const useGoStore = create<GoStore>()(
  persist(
    (set, get) => ({
      games: mockGames,
      problems: mockProblems,
      josekis: mockJosekis,
      dailyTasks: mockDailyTasks,
      matches: mockMatches,
      ranks: mockRanks,
      settings: initialSettings,
      currentGameId: null,
      currentMoveNode: null,

      addGame: (gameData) => {
        const id = nanoid();
        const now = Date.now();
        const newGame: GameRecord = {
          ...gameData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ games: [...state.games, newGame] }));
        return id;
      },

      updateGame: (id, updates) => {
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g
          ),
        }));
      },

      deleteGame: (id) => {
        set((state) => ({
          games: state.games.filter((g) => g.id !== id),
          currentGameId: state.currentGameId === id ? null : state.currentGameId,
        }));
      },

      setCurrentGame: (id) => {
        set({ currentGameId: id });
        if (id) {
          const game = get().games.find((g) => g.id === id);
          if (game) {
            set({ currentMoveNode: game.rootNode });
          }
        } else {
          set({ currentMoveNode: null });
        }
      },

      setCurrentMoveNode: (node) => {
        set({ currentMoveNode: node });
      },

      addProblem: (problemData) => {
        const id = nanoid();
        set((state) => ({ problems: [...state.problems, { ...problemData, id }] }));
        return id;
      },

      updateProblem: (id, updates) => {
        set((state) => ({
          problems: state.problems.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteProblem: (id) => {
        set((state) => ({
          problems: state.problems.filter((p) => p.id !== id),
        }));
      },

      addPracticeRecord: (problemId, record) => {
        const id = nanoid();
        set((state) => ({
          problems: state.problems.map((p) =>
            p.id === problemId
              ? { ...p, practiceRecords: [...p.practiceRecords, { ...record, id }] }
              : p
          ),
        }));
      },

      addJoseki: (josekiData) => {
        const id = nanoid();
        set((state) => ({ josekis: [...state.josekis, { ...josekiData, id }] }));
        return id;
      },

      updateJoseki: (id, updates) => {
        set((state) => ({
          josekis: state.josekis.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        }));
      },

      deleteJoseki: (id) => {
        set((state) => ({
          josekis: state.josekis.filter((j) => j.id !== id),
        }));
      },

      addDailyTask: (taskData) => {
        const id = nanoid();
        set((state) => ({ dailyTasks: [...state.dailyTasks, { ...taskData, id }] }));
        return id;
      },

      updateDailyTask: (id, updates) => {
        set((state) => ({
          dailyTasks: state.dailyTasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteDailyTask: (id) => {
        set((state) => ({
          dailyTasks: state.dailyTasks.filter((t) => t.id !== id),
        }));
      },

      toggleDailyTask: (id) => {
        set((state) => ({
          dailyTasks: state.dailyTasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isCompleted: !t.isCompleted,
                  completedAt: !t.isCompleted ? Date.now() : undefined,
                }
              : t
          ),
        }));
      },

      addMatch: (matchData) => {
        const id = nanoid();
        set((state) => ({ matches: [...state.matches, { ...matchData, id }] }));
        return id;
      },

      updateMatch: (id, updates) => {
        set((state) => ({
          matches: state.matches.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },

      deleteMatch: (id) => {
        set((state) => ({
          matches: state.matches.filter((m) => m.id !== id),
        }));
      },

      addRank: (rankData) => {
        const id = nanoid();
        set((state) => ({ ranks: [...state.ranks, { ...rankData, id }] }));
        return id;
      },

      updateRank: (id, updates) => {
        set((state) => ({
          ranks: state.ranks.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      deleteRank: (id) => {
        set((state) => ({
          ranks: state.ranks.filter((r) => r.id !== id),
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      addMoveMark: (gameId, nodeId, mark) => {
        const markId = nanoid();
        const game = get().games.find((g) => g.id === gameId);
        if (!game) return;

        const newRootNode = updateNodeInTree(game.rootNode, nodeId, (node) => {
          if (!node.marks) {
            node.marks = [];
          }
          node.marks.push({ ...mark, id: markId });
        });

        get().updateGame(gameId, { rootNode: newRootNode });
        
        if (get().currentMoveNode?.id === nodeId) {
          const updatedNode = JSON.parse(JSON.stringify(get().currentMoveNode));
          if (!updatedNode.marks) updatedNode.marks = [];
          updatedNode.marks.push({ ...mark, id: markId });
          set({ currentMoveNode: updatedNode });
        }
      },

      removeMoveMark: (gameId, nodeId, markId) => {
        const game = get().games.find((g) => g.id === gameId);
        if (!game) return;

        const newRootNode = updateNodeInTree(game.rootNode, nodeId, (node) => {
          if (node.marks) {
            node.marks = node.marks.filter((m: MoveMark) => m.id !== markId);
          }
        });

        get().updateGame(gameId, { rootNode: newRootNode });
        
        if (get().currentMoveNode?.id === nodeId) {
          const updatedNode = JSON.parse(JSON.stringify(get().currentMoveNode));
          if (updatedNode.marks) {
            updatedNode.marks = updatedNode.marks.filter((m: MoveMark) => m.id !== markId);
          }
          set({ currentMoveNode: updatedNode });
        }
      },

      updateNodeComment: (gameId, nodeId, comment) => {
        const game = get().games.find((g) => g.id === gameId);
        if (!game) return;

        const newRootNode = updateNodeInTree(game.rootNode, nodeId, (node) => {
          node.comment = comment;
        });

        get().updateGame(gameId, { rootNode: newRootNode });
        
        if (get().currentMoveNode?.id === nodeId) {
          const updatedNode = { ...get().currentMoveNode, comment };
          set({ currentMoveNode: updatedNode });
        }
      },
    }),
    {
      name: 'go-storage',
      partialize: (state) => ({
        games: state.games,
        problems: state.problems,
        josekis: state.josekis,
        dailyTasks: state.dailyTasks,
        matches: state.matches,
        ranks: state.ranks,
        settings: state.settings,
      }),
    }
  )
);

export function importSGFGame(sgfContent: string, category: GameCategory, tags: string[] = []): string {
  const gameData = parseSGFToGameRecord(sgfContent, category, tags);
  return useGoStore.getState().addGame(gameData);
}
