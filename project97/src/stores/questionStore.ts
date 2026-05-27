import { create } from 'zustand';
import type { Question } from '../types';
import { getItem, setItem, generateId } from '../utils/storage';

interface QuestionStore {
  questions: Question[];
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  getQuestion: (id: string) => Question | undefined;
  addSolution: (questionId: string, solution: Omit<Question['solutions'][0], 'id'>) => void;
  loadQuestions: () => void;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],

  loadQuestions: () => {
    const stored = getItem<Question[]>('questions');
    if (stored) {
      set({ questions: stored });
    }
  },

  addQuestion: (question) => {
    const now = new Date().toISOString();
    const newQuestion: Question = {
      ...question,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const questions = [...get().questions, newQuestion];
    set({ questions });
    setItem('questions', questions);
  },

  updateQuestion: (id, updates) => {
    const questions = get().questions.map((q) =>
      q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
    );
    set({ questions });
    setItem('questions', questions);
  },

  deleteQuestion: (id) => {
    const questions = get().questions.filter((q) => q.id !== id);
    set({ questions });
    setItem('questions', questions);
  },

  getQuestion: (id) => get().questions.find((q) => q.id === id),

  addSolution: (questionId, solution) => {
    const questions = get().questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          solutions: [...q.solutions, { ...solution, id: generateId() }],
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    set({ questions });
    setItem('questions', questions);
  },
}));
