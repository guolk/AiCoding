import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Topic, Guest, Episode, Outline, RecordingSession, RecordingFile,
  EditingTask, Transcript, Asset, Platform, Publication,
  AnalyticsData, Feedback, CommunicationEntry, TodoItem,
} from '../types';
import { generateId } from '../utils/helpers';
import {
  mockTopics, mockGuests, mockEpisodes, mockOutlines, mockSessions,
  mockFiles, mockEditingTasks, mockTranscripts, mockAssets, mockPlatforms,
  mockPublications, mockAnalytics, mockFeedbacks, mockTodos,
} from '../data/mockData';

interface AppState {
  topics: Topic[];
  guests: Guest[];
  episodes: Episode[];
  outlines: Outline[];
  sessions: RecordingSession[];
  files: RecordingFile[];
  editingTasks: EditingTask[];
  transcripts: Transcript[];
  assets: Asset[];
  platforms: Platform[];
  publications: Publication[];
  analytics: AnalyticsData[];
  feedbacks: Feedback[];
  todos: TodoItem[];

  addTopic: (topic: Omit<Topic, 'id' | 'createdAt'>) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;

  addGuest: (guest: Omit<Guest, 'id' | 'communicationLog'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  addGuestCommunication: (guestId: string, entry: Omit<CommunicationEntry, 'date'>) => void;

  addEpisode: (episode: Omit<Episode, 'id'>) => void;
  updateEpisode: (id: string, updates: Partial<Episode>) => void;

  saveOutline: (outline: Omit<Outline, 'id'>) => void;

  addSession: (session: Omit<RecordingSession, 'id'>) => void;
  updateSession: (id: string, updates: Partial<RecordingSession>) => void;

  addFile: (file: Omit<RecordingFile, 'id'>) => void;

  updateEditingTask: (id: string, updates: Partial<EditingTask>) => void;

  saveTranscript: (transcript: Omit<Transcript, 'id'>) => void;
  updateTranscript: (id: string, updates: Partial<Transcript>) => void;

  updateAsset: (id: string, updates: Partial<Asset>) => void;

  updatePlatform: (id: string, updates: Partial<Platform>) => void;

  addPublication: (publication: Omit<Publication, 'id'>) => void;
  updatePublication: (id: string, updates: Partial<Publication>) => void;

  toggleFeedbackHighlight: (id: string) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;

  toggleTodo: (id: string) => void;
  addTodo: (todo: Omit<TodoItem, 'id'>) => void;
  deleteTodo: (id: string) => void;

  resetToMock: () => void;
}

const initialState = {
  topics: mockTopics,
  guests: mockGuests,
  episodes: mockEpisodes,
  outlines: mockOutlines,
  sessions: mockSessions,
  files: mockFiles,
  editingTasks: mockEditingTasks,
  transcripts: mockTranscripts,
  assets: mockAssets,
  platforms: mockPlatforms,
  publications: mockPublications,
  analytics: mockAnalytics,
  feedbacks: mockFeedbacks,
  todos: mockTodos,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addTopic: (topic) => set((state) => ({
        topics: [...state.topics, { ...topic, id: generateId(), createdAt: new Date().toISOString() }],
      })),
      updateTopic: (id, updates) => set((state) => ({
        topics: state.topics.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),
      deleteTopic: (id) => set((state) => ({
        topics: state.topics.filter((t) => t.id !== id),
      })),

      addGuest: (guest) => set((state) => ({
        guests: [...state.guests, { ...guest, id: generateId(), communicationLog: [] }],
      })),
      updateGuest: (id, updates) => set((state) => ({
        guests: state.guests.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),
      addGuestCommunication: (guestId, entry) => set((state) => ({
        guests: state.guests.map((g) =>
          g.id === guestId
            ? {
                ...g,
                lastContact: new Date().toISOString(),
                communicationLog: [...g.communicationLog, { ...entry, date: new Date().toISOString() }],
              }
            : g
        ),
      })),

      addEpisode: (episode) => set((state) => ({
        episodes: [...state.episodes, { ...episode, id: generateId() }],
      })),
      updateEpisode: (id, updates) => set((state) => ({
        episodes: state.episodes.map((e) => e.id === id ? { ...e, ...updates } : e),
      })),

      saveOutline: (outline) => set((state) => {
        const existing = state.outlines.find((o) => o.episodeId === outline.episodeId);
        if (existing) {
          return {
            outlines: state.outlines.map((o) =>
              o.episodeId === outline.episodeId ? { ...o, ...outline } : o
            ),
          };
        }
        return { outlines: [...state.outlines, { ...outline, id: generateId() }] };
      }),

      addSession: (session) => set((state) => ({
        sessions: [...state.sessions, { ...session, id: generateId() }],
      })),
      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === id ? { ...s, ...updates } : s),
      })),

      addFile: (file) => set((state) => ({
        files: [...state.files, { ...file, id: generateId() }],
      })),

      updateEditingTask: (id, updates) => set((state) => ({
        editingTasks: state.editingTasks.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),

      saveTranscript: (transcript) => set((state) => {
        const existing = state.transcripts.find((t) => t.episodeId === transcript.episodeId);
        if (existing) {
          return {
            transcripts: state.transcripts.map((t) =>
              t.episodeId === transcript.episodeId ? { ...t, ...transcript } : t
            ),
          };
        }
        return { transcripts: [...state.transcripts, { ...transcript, id: generateId() }] };
      }),
      updateTranscript: (id, updates) => set((state) => ({
        transcripts: state.transcripts.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),

      updateAsset: (id, updates) => set((state) => ({
        assets: state.assets.map((a) => a.id === id ? { ...a, ...updates } : a),
      })),

      updatePlatform: (id, updates) => set((state) => ({
        platforms: state.platforms.map((p) => p.id === id ? { ...p, ...updates } : p),
      })),

      addPublication: (publication) => set((state) => ({
        publications: [...state.publications, { ...publication, id: generateId() }],
      })),
      updatePublication: (id, updates) => set((state) => ({
        publications: state.publications.map((p) => p.id === id ? { ...p, ...updates } : p),
      })),

      toggleFeedbackHighlight: (id) => set((state) => ({
        feedbacks: state.feedbacks.map((f) =>
          f.id === id ? { ...f, highlighted: !f.highlighted } : f
        ),
      })),
      addFeedback: (feedback) => set((state) => ({
        feedbacks: [...state.feedbacks, { ...feedback, id: generateId(), createdAt: new Date().toISOString() }],
      })),

      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
      })),
      addTodo: (todo) => set((state) => ({
        todos: [...state.todos, { ...todo, id: generateId() }],
      })),
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      })),

      resetToMock: () => set(initialState),
    }),
    {
      name: 'podcast-studio-storage',
      partialize: (state) => ({
        topics: state.topics,
        guests: state.guests,
        episodes: state.episodes,
        outlines: state.outlines,
        sessions: state.sessions,
        files: state.files,
        editingTasks: state.editingTasks,
        transcripts: state.transcripts,
        assets: state.assets,
        platforms: state.platforms,
        publications: state.publications,
        analytics: state.analytics,
        feedbacks: state.feedbacks,
        todos: state.todos,
      }),
    }
  )
);
