import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StitchNote, ProblemSolution } from '@/types';
import { generateId } from '@/utils/colorUtils';

interface LearningState {
  stitchNotes: StitchNote[];
  problemSolutions: ProblemSolution[];
  
  addStitchNote: (note: Omit<StitchNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStitchNote: (id: string, updates: Partial<StitchNote>) => void;
  deleteStitchNote: (id: string) => void;
  
  addProblemSolution: (solution: Omit<ProblemSolution, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProblemSolution: (id: string, updates: Partial<ProblemSolution>) => void;
  deleteProblemSolution: (id: string) => void;
  
  getStitchNotesByType: (type?: string) => StitchNote[];
  searchProblemSolutions: (query: string) => ProblemSolution[];
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      stitchNotes: [],
      problemSolutions: [],
      
      addStitchNote: (noteData) => {
        const now = new Date().toISOString();
        const newNote: StitchNote = {
          ...noteData,
          id: generateId(),
          createdAt: now,
          updatedAt: now
        };
        set(state => ({ stitchNotes: [...state.stitchNotes, newNote] }));
      },
      
      updateStitchNote: (id, updates) => {
        const now = new Date().toISOString();
        set(state => ({
          stitchNotes: state.stitchNotes.map(note =>
            note.id === id ? { ...note, ...updates, updatedAt: now } : note
          )
        }));
      },
      
      deleteStitchNote: (id) => {
        set(state => ({
          stitchNotes: state.stitchNotes.filter(note => note.id !== id)
        }));
      },
      
      addProblemSolution: (solutionData) => {
        const now = new Date().toISOString();
        const newSolution: ProblemSolution = {
          ...solutionData,
          id: generateId(),
          createdAt: now,
          updatedAt: now
        };
        set(state => ({ problemSolutions: [...state.problemSolutions, newSolution] }));
      },
      
      updateProblemSolution: (id, updates) => {
        const now = new Date().toISOString();
        set(state => ({
          problemSolutions: state.problemSolutions.map(sol =>
            sol.id === id ? { ...sol, ...updates, updatedAt: now } : sol
          )
        }));
      },
      
      deleteProblemSolution: (id) => {
        set(state => ({
          problemSolutions: state.problemSolutions.filter(sol => sol.id !== id)
        }));
      },
      
      getStitchNotesByType: (type) => {
        const notes = get().stitchNotes;
        if (!type) return notes;
        return notes.filter(n => n.type === type);
      },
      
      searchProblemSolutions: (query) => {
        const solutions = get().problemSolutions;
        if (!query.trim()) return solutions;
        
        const lowerQuery = query.toLowerCase();
        return solutions.filter(s =>
          s.title.toLowerCase().includes(lowerQuery) ||
          s.problem.toLowerCase().includes(lowerQuery) ||
          s.solution.toLowerCase().includes(lowerQuery) ||
          s.tags.some(t => t.toLowerCase().includes(lowerQuery))
        );
      }
    }),
    {
      name: 'learning-storage'
    }
  )
);
