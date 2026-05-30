import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Game,
  CollectionItem,
  PlayRecord,
  RuleNote,
  Review,
  Expansion,
  CollectionStatus,
  RuleNoteType,
  ReviewType,
} from '@/types';
import { generateId } from '@/utils/helpers';
import {
  seedGames,
  seedCollectionItems,
  seedPlayRecords,
  seedRuleNotes,
  seedReviews,
  seedExpansions,
} from '@/utils/seedData';

interface GameStore {
  initialized: boolean;
  games: Game[];
  collectionItems: CollectionItem[];
  playRecords: PlayRecord[];
  ruleNotes: RuleNote[];
  reviews: Review[];
  expansions: Expansion[];
  
  initData: () => void;
  
  addGame: (game: Omit<Game, 'id'>) => string;
  updateGame: (id: string, game: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  
  addCollectionItem: (item: Omit<CollectionItem, 'id'>) => void;
  updateCollectionItem: (id: string, item: Partial<CollectionItem>) => void;
  deleteCollectionItem: (id: string) => void;
  updateCollectionItemByGameId: (gameId: string, updates: Partial<CollectionItem>) => void;
  
  addPlayRecord: (record: Omit<PlayRecord, 'id'>) => void;
  updatePlayRecord: (id: string, record: Partial<PlayRecord>) => void;
  deletePlayRecord: (id: string) => void;
  
  addRuleNote: (note: Omit<RuleNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRuleNote: (id: string, note: Partial<RuleNote>) => void;
  deleteRuleNote: (id: string) => void;
  
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  updateReview: (id: string, review: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  
  addExpansion: (expansion: Omit<Expansion, 'id'>) => void;
  updateExpansion: (id: string, expansion: Partial<Expansion>) => void;
  deleteExpansion: (id: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      initialized: false,
      games: [],
      collectionItems: [],
      playRecords: [],
      ruleNotes: [],
      reviews: [],
      expansions: [],
      
      initData: () => {
        if (!get().initialized) {
          set({
            initialized: true,
            games: seedGames,
            collectionItems: seedCollectionItems,
            playRecords: seedPlayRecords,
            ruleNotes: seedRuleNotes,
            reviews: seedReviews,
            expansions: seedExpansions,
          });
        }
      },
      
      addGame: (game) => {
        const newId = generateId();
        set((state) => ({
          games: [...state.games, { ...game, id: newId }],
        }));
        return newId;
      },
      
      updateGame: (id, game) =>
        set((state) => ({
          games: state.games.map((g) => (g.id === id ? { ...g, ...game } : g)),
        })),
      
      deleteGame: (id) =>
        set((state) => ({
          games: state.games.filter((g) => g.id !== id),
          collectionItems: state.collectionItems.filter((c) => c.gameId !== id),
          playRecords: state.playRecords.filter((p) => p.gameId !== id),
          ruleNotes: state.ruleNotes.filter((r) => r.gameId !== id),
          reviews: state.reviews.filter((r) => r.gameId !== id),
          expansions: state.expansions.filter((e) => e.baseGameId !== id),
        })),
      
      addCollectionItem: (item) =>
        set((state) => ({
          collectionItems: [...state.collectionItems, { ...item, id: generateId() }],
        })),
      
      updateCollectionItem: (id, item) =>
        set((state) => ({
          collectionItems: state.collectionItems.map((c) =>
            c.id === id ? { ...c, ...item } : c
          ),
        })),
      
      deleteCollectionItem: (id) =>
        set((state) => ({
          collectionItems: state.collectionItems.filter((c) => c.id !== id),
        })),
      
      updateCollectionItemByGameId: (gameId, updates) =>
        set((state) => ({
          collectionItems: state.collectionItems.map((c) =>
            c.gameId === gameId ? { ...c, ...updates } : c
          ),
        })),
      
      addPlayRecord: (record) =>
        set((state) => ({
          playRecords: [...state.playRecords, { ...record, id: generateId() }],
        })),
      
      updatePlayRecord: (id, record) =>
        set((state) => ({
          playRecords: state.playRecords.map((p) =>
            p.id === id ? { ...p, ...record } : p
          ),
        })),
      
      deletePlayRecord: (id) =>
        set((state) => ({
          playRecords: state.playRecords.filter((p) => p.id !== id),
        })),
      
      addRuleNote: (note) => {
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          ruleNotes: [
            ...state.ruleNotes,
            { ...note, id: generateId(), createdAt: now, updatedAt: now },
          ],
        }));
      },
      
      updateRuleNote: (id, note) => {
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          ruleNotes: state.ruleNotes.map((r) =>
            r.id === id ? { ...r, ...note, updatedAt: now } : r
          ),
        }));
      },
      
      deleteRuleNote: (id) =>
        set((state) => ({
          ruleNotes: state.ruleNotes.filter((r) => r.id !== id),
        })),
      
      addReview: (review) => {
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          reviews: [
            ...state.reviews,
            { ...review, id: generateId(), createdAt: now },
          ],
        }));
      },
      
      updateReview: (id, review) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, ...review } : r
          ),
        })),
      
      deleteReview: (id) =>
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== id),
        })),
      
      addExpansion: (expansion) =>
        set((state) => ({
          expansions: [...state.expansions, { ...expansion, id: generateId() }],
        })),
      
      updateExpansion: (id, expansion) =>
        set((state) => ({
          expansions: state.expansions.map((e) =>
            e.id === id ? { ...e, ...expansion } : e
          ),
        })),
      
      deleteExpansion: (id) =>
        set((state) => ({
          expansions: state.expansions.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'boardgame-storage',
    }
  )
);

export type { CollectionStatus, RuleNoteType, ReviewType };
