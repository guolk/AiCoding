import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Visit,
  Exhibition,
  LearningNote,
  WishlistItem,
  TripPlan,
  ExhibitionReminder,
} from '@/types';

interface MuseumStore {
  visits: Visit[];
  exhibitions: Exhibition[];
  learningNotes: LearningNote[];
  wishlist: WishlistItem[];
  tripPlans: TripPlan[];
  exhibitionReminders: ExhibitionReminder[];

  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, visit: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;

  addExhibition: (exhibition: Exhibition) => void;
  updateExhibition: (id: string, exhibition: Partial<Exhibition>) => void;
  deleteExhibition: (id: string) => void;

  addLearningNote: (note: LearningNote) => void;
  updateLearningNote: (id: string, note: Partial<LearningNote>) => void;
  deleteLearningNote: (id: string) => void;

  addWishlistItem: (item: WishlistItem) => void;
  updateWishlistItem: (id: string, item: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;

  addTripPlan: (plan: TripPlan) => void;
  updateTripPlan: (id: string, plan: Partial<TripPlan>) => void;
  deleteTripPlan: (id: string) => void;

  addExhibitionReminder: (reminder: ExhibitionReminder) => void;
  updateExhibitionReminder: (id: string, reminder: Partial<ExhibitionReminder>) => void;
  deleteExhibitionReminder: (id: string) => void;
}

export const useMuseumStore = create<MuseumStore>()(
  persist(
    (set) => ({
      visits: [],
      exhibitions: [],
      learningNotes: [],
      wishlist: [],
      tripPlans: [],
      exhibitionReminders: [],

      addVisit: (visit) =>
        set((state) => ({ visits: [visit, ...state.visits] })),
      updateVisit: (id, updates) =>
        set((state) => ({
          visits: state.visits.map((v) =>
            v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
          ),
        })),
      deleteVisit: (id) =>
        set((state) => ({
          visits: state.visits.filter((v) => v.id !== id),
        })),

      addExhibition: (exhibition) =>
        set((state) => ({ exhibitions: [exhibition, ...state.exhibitions] })),
      updateExhibition: (id, updates) =>
        set((state) => ({
          exhibitions: state.exhibitions.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteExhibition: (id) =>
        set((state) => ({
          exhibitions: state.exhibitions.filter((e) => e.id !== id),
        })),

      addLearningNote: (note) =>
        set((state) => ({ learningNotes: [note, ...state.learningNotes] })),
      updateLearningNote: (id, updates) =>
        set((state) => ({
          learningNotes: state.learningNotes.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
        })),
      deleteLearningNote: (id) =>
        set((state) => ({
          learningNotes: state.learningNotes.filter((n) => n.id !== id),
        })),

      addWishlistItem: (item) =>
        set((state) => ({ wishlist: [item, ...state.wishlist] })),
      updateWishlistItem: (id, updates) =>
        set((state) => ({
          wishlist: state.wishlist.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),
      deleteWishlistItem: (id) =>
        set((state) => ({
          wishlist: state.wishlist.filter((w) => w.id !== id),
        })),

      addTripPlan: (plan) =>
        set((state) => ({ tripPlans: [plan, ...state.tripPlans] })),
      updateTripPlan: (id, updates) =>
        set((state) => ({
          tripPlans: state.tripPlans.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteTripPlan: (id) =>
        set((state) => ({
          tripPlans: state.tripPlans.filter((p) => p.id !== id),
        })),

      addExhibitionReminder: (reminder) =>
        set((state) => ({
          exhibitionReminders: [reminder, ...state.exhibitionReminders],
        })),
      updateExhibitionReminder: (id, updates) =>
        set((state) => ({
          exhibitionReminders: state.exhibitionReminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      deleteExhibitionReminder: (id) =>
        set((state) => ({
          exhibitionReminders: state.exhibitionReminders.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'museum-tracker-storage',
    }
  )
);
