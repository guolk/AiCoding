import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Yarn, YarnUsage } from '@/types';
import { generateId, getColorCategory } from '@/utils/colorUtils';

interface MaterialState {
  yarns: Yarn[];
  yarnUsageHistory: YarnUsage[];
  addYarn: (yarn: Omit<Yarn, 'id' | 'category' | 'createdAt' | 'updatedAt'>) => void;
  updateYarn: (id: string, updates: Partial<Omit<Yarn, 'id' | 'createdAt'>>) => void;
  deleteYarn: (id: string) => void;
  useYarn: (yarnId: string, projectId: string, weight: number) => void;
  returnYarn: (yarnId: string, projectId: string, weight: number) => void;
  getYarnById: (id: string) => Yarn | undefined;
  getYarnsByCategory: () => Record<string, Yarn[]>;
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      yarns: [],
      yarnUsageHistory: [],
      
      addYarn: (yarnData) => {
        const now = new Date().toISOString();
        const newYarn: Yarn = {
          ...yarnData,
          id: generateId(),
          category: getColorCategory(yarnData.colorHex),
          createdAt: now,
          updatedAt: now
        };
        set(state => ({ yarns: [...state.yarns, newYarn] }));
      },
      
      updateYarn: (id, updates) => {
        set(state => ({
          yarns: state.yarns.map(yarn => 
            yarn.id === id 
              ? { 
                  ...yarn, 
                  ...updates,
                  category: updates.colorHex ? getColorCategory(updates.colorHex) : yarn.category,
                  updatedAt: new Date().toISOString() 
                }
              : yarn
          )
        }));
      },
      
      deleteYarn: (id) => {
        set(state => ({
          yarns: state.yarns.filter(yarn => yarn.id !== id),
          yarnUsageHistory: state.yarnUsageHistory.filter(usage => usage.yarnId !== id)
        }));
      },
      
      useYarn: (yarnId, projectId, weight) => {
        const now = new Date().toISOString();
        set(state => {
          const yarn = state.yarns.find(y => y.id === yarnId);
          if (!yarn) return state;
          
          const newRemaining = Math.max(0, yarn.remainingWeight - weight);
          
          return {
            yarns: state.yarns.map(y =>
              y.id === yarnId
                ? { ...y, remainingWeight: newRemaining, updatedAt: now }
                : y
            ),
            yarnUsageHistory: [
              ...state.yarnUsageHistory,
              { id: generateId(), yarnId, projectId, weightUsed: weight, createdAt: now }
            ]
          };
        });
      },
      
      returnYarn: (yarnId, projectId, weight) => {
        const now = new Date().toISOString();
        set(state => {
          const yarn = state.yarns.find(y => y.id === yarnId);
          if (!yarn) return state;
          
          const newRemaining = Math.min(yarn.weight, yarn.remainingWeight + weight);
          
          return {
            yarns: state.yarns.map(y =>
              y.id === yarnId
                ? { ...y, remainingWeight: newRemaining, updatedAt: now }
                : y
            )
          };
        });
      },
      
      getYarnById: (id) => {
        return get().yarns.find(yarn => yarn.id === id);
      },
      
      getYarnsByCategory: () => {
        const yarns = get().yarns;
        const categories: Record<string, Yarn[]> = {};
        
        yarns.forEach(yarn => {
          if (!categories[yarn.category]) {
            categories[yarn.category] = [];
          }
          categories[yarn.category].push(yarn);
        });
        
        return categories;
      }
    }),
    {
      name: 'material-storage'
    }
  )
);
