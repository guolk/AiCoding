import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pattern, Pixel, SymmetrySettings, EditorSettings } from '@/types';
import { generateId, generateSymmetricPixels } from '@/utils/colorUtils';

interface PatternState {
  patterns: Pattern[];
  currentPattern: Pattern | null;
  editorSettings: EditorSettings;
  createPattern: (name: string, gridWidth: number, gridHeight: number) => string;
  loadPattern: (id: string) => void;
  saveCurrentPattern: () => void;
  updateCurrentPattern: (updates: Partial<Pattern>) => void;
  setPixel: (x: number, y: number, color: string, yarnId?: string) => void;
  setPixels: (pixels: Pixel[]) => void;
  erasePixel: (x: number, y: number) => void;
  clearPattern: () => void;
  deletePattern: (id: string) => void;
  updateSymmetry: (symmetry: Partial<SymmetrySettings>) => void;
  setEditorSettings: (settings: Partial<EditorSettings>) => void;
  getPatternById: (id: string) => Pattern | undefined;
  duplicatePattern: (id: string) => void;
}

const defaultSymmetry: SymmetrySettings = {
  horizontal: false,
  vertical: false,
  diagonal1: false,
  diagonal2: false,
  rotation: 0,
  repeatX: 1,
  repeatY: 1
};

const defaultEditorSettings: EditorSettings = {
  currentColor: '#000000',
  currentYarnId: null,
  tool: 'brush',
  brushSize: 1,
  showGrid: true,
  showSymmetry: false
};

export const usePatternStore = create<PatternState>()(
  persist(
    (set, get) => ({
      patterns: [],
      currentPattern: null,
      editorSettings: defaultEditorSettings,
      
      createPattern: (name, gridWidth, gridHeight) => {
        const now = new Date().toISOString();
        const id = generateId();
        const newPattern: Pattern = {
          id,
          name,
          description: '',
          gridWidth,
          gridHeight,
          cellSize: 20,
          pixels: [],
          symmetry: { ...defaultSymmetry },
          usedYarns: [],
          createdAt: now,
          updatedAt: now
        };
        
        set(state => ({
          patterns: [...state.patterns, newPattern],
          currentPattern: newPattern
        }));
        
        return id;
      },
      
      loadPattern: (id) => {
        const pattern = get().patterns.find(p => p.id === id);
        if (pattern) {
          set({ currentPattern: pattern });
        }
      },
      
      saveCurrentPattern: () => {
        const { currentPattern, patterns } = get();
        if (!currentPattern) return;
        
        const updated = {
          ...currentPattern,
          updatedAt: new Date().toISOString()
        };
        
        set({
          patterns: patterns.map(p => p.id === currentPattern.id ? updated : p),
          currentPattern: updated
        });
      },
      
      updateCurrentPattern: (updates) => {
        const { currentPattern } = get();
        if (!currentPattern) return;
        
        set({
          currentPattern: { ...currentPattern, ...updates }
        });
      },
      
      setPixel: (x, y, color, yarnId) => {
        const { currentPattern } = get();
        if (!currentPattern) return;
        
        const pixelMap = new Map(currentPattern.pixels.map(p => [`${p.x},${p.y}`, p]));
        const key = `${x},${y}`;
        
        if (yarnId && !currentPattern.usedYarns.includes(yarnId)) {
          set(state => ({
            currentPattern: state.currentPattern ? {
              ...state.currentPattern,
              usedYarns: [...state.currentPattern.usedYarns, yarnId]
            } : null
          }));
        }
        
        const basePixels = [...currentPattern.pixels.filter(p => !(p.x === x && p.y === y)), { x, y, color, yarnId }];
        
        if (currentPattern.symmetry.horizontal || currentPattern.symmetry.vertical || 
            currentPattern.symmetry.diagonal1 || currentPattern.symmetry.diagonal2) {
          const allPixels = generateSymmetricPixels(
            basePixels,
            currentPattern.gridWidth,
            currentPattern.gridHeight,
            currentPattern.symmetry
          );
          
          set(state => ({
            currentPattern: state.currentPattern ? {
              ...state.currentPattern,
              pixels: allPixels
            } : null
          }));
        } else {
          set(state => ({
            currentPattern: state.currentPattern ? {
              ...state.currentPattern,
              pixels: basePixels
            } : null
          }));
        }
        
        pixelMap.set(key, { x, y, color, yarnId });
      },
      
      setPixels: (newPixels) => {
        set(state => ({
          currentPattern: state.currentPattern ? {
            ...state.currentPattern,
            pixels: newPixels
          } : null
        }));
      },
      
      erasePixel: (x, y) => {
        const { currentPattern } = get();
        if (!currentPattern) return;
        
        const centerX = (currentPattern.gridWidth - 1) / 2;
        const centerY = (currentPattern.gridHeight - 1) / 2;
        
        const pixelsToRemove = [`${x},${y}`];
        
        if (currentPattern.symmetry.vertical) {
          pixelsToRemove.push(`${Math.floor(centerX * 2 - x)},${y}`);
        }
        if (currentPattern.symmetry.horizontal) {
          pixelsToRemove.push(`${x},${Math.floor(centerY * 2 - y)}`);
        }
        if (currentPattern.symmetry.vertical && currentPattern.symmetry.horizontal) {
          pixelsToRemove.push(`${Math.floor(centerX * 2 - x)},${Math.floor(centerY * 2 - y)}`);
        }
        
        set(state => ({
          currentPattern: state.currentPattern ? {
            ...state.currentPattern,
            pixels: state.currentPattern.pixels.filter(p => !pixelsToRemove.includes(`${p.x},${p.y}`))
          } : null
        }));
      },
      
      clearPattern: () => {
        set(state => ({
          currentPattern: state.currentPattern ? {
            ...state.currentPattern,
            pixels: []
          } : null
        }));
      },
      
      deletePattern: (id) => {
        set(state => ({
          patterns: state.patterns.filter(p => p.id !== id),
          currentPattern: state.currentPattern?.id === id ? null : state.currentPattern
        }));
      },
      
      updateSymmetry: (symmetry) => {
        set(state => ({
          currentPattern: state.currentPattern ? {
            ...state.currentPattern,
            symmetry: { ...state.currentPattern.symmetry, ...symmetry }
          } : null
        }));
      },
      
      setEditorSettings: (settings) => {
        set(state => ({
          editorSettings: { ...state.editorSettings, ...settings }
        }));
      },
      
      getPatternById: (id) => {
        return get().patterns.find(p => p.id === id);
      },
      
      duplicatePattern: (id) => {
        const pattern = get().patterns.find(p => p.id === id);
        if (!pattern) return;
        
        const now = new Date().toISOString();
        const newPattern: Pattern = {
          ...pattern,
          id: generateId(),
          name: `${pattern.name} (副本)`,
          createdAt: now,
          updatedAt: now
        };
        
        set(state => ({
          patterns: [...state.patterns, newPattern]
        }));
      }
    }),
    {
      name: 'pattern-storage',
      partialize: (state) => ({ patterns: state.patterns, editorSettings: state.editorSettings })
    }
  )
);
