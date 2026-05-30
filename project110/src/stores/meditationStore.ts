import { create } from 'zustand';
import { BreathingTechnique, MeditationScript, MeditationCategory } from '@/types';
import { breathingTechniques, getBreathingTechniqueById } from '@/data/breathing';
import { defaultMeditationScripts, getFavoriteScripts, getScriptsByCategory, getMeditationScriptById } from '@/data/meditation';
import { getLocalStorage, setLocalStorage, STORAGE_KEYS } from '@/utils/storage';
import { generateId } from '@/utils';

interface MeditationStore {
  breathingTechniques: BreathingTechnique[];
  meditationScripts: MeditationScript[];
  
  loadData: () => void;
  
  getBreathingTechniqueById: (id: string) => BreathingTechnique | undefined;
  
  getFavoriteScripts: () => MeditationScript[];
  getScriptsByCategory: (category: MeditationCategory) => MeditationScript[];
  toggleFavorite: (scriptId: string) => void;
  addCustomScript: (script: Omit<MeditationScript, 'id' | 'isBuiltIn'>) => void;
  deleteCustomScript: (id: string) => void;
  updateScript: (id: string, updates: Partial<MeditationScript>) => void;
}

export const useMeditationStore = create<MeditationStore>((set, get) => ({
  breathingTechniques,
  meditationScripts: defaultMeditationScripts,
  
  loadData: () => {
    const savedScripts = getLocalStorage<MeditationScript[]>(STORAGE_KEYS.MEDITATION_SCRIPTS, []);
    
    const mergedScripts = [
      ...defaultMeditationScripts,
      ...savedScripts.filter(s => !defaultMeditationScripts.find(ds => ds.id === s.id))
    ];
    
    set({ meditationScripts: mergedScripts });
  },
  
  getBreathingTechniqueById: (id) => {
    return getBreathingTechniqueById(id);
  },
  
  getFavoriteScripts: () => {
    return getFavoriteScripts(get().meditationScripts);
  },
  
  getScriptsByCategory: (category) => {
    return getScriptsByCategory(category, get().meditationScripts);
  },
  
  toggleFavorite: (scriptId) => {
    const { meditationScripts } = get();
    const updatedScripts = meditationScripts.map(script => 
      script.id === scriptId 
        ? { ...script, isFavorite: !script.isFavorite }
        : script
    );
    
    setLocalStorage(STORAGE_KEYS.MEDITATION_SCRIPTS, updatedScripts);
    set({ meditationScripts: updatedScripts });
  },
  
  addCustomScript: (script) => {
    const { meditationScripts } = get();
    const newScript: MeditationScript = {
      ...script,
      id: generateId(),
      isBuiltIn: false,
    };
    
    const updatedScripts = [...meditationScripts, newScript];
    setLocalStorage(STORAGE_KEYS.MEDITATION_SCRIPTS, updatedScripts);
    set({ meditationScripts: updatedScripts });
  },
  
  deleteCustomScript: (id) => {
    const { meditationScripts } = get();
    const script = meditationScripts.find(s => s.id === id);
    
    if (script && !script.isBuiltIn) {
      const updatedScripts = meditationScripts.filter(s => s.id !== id);
      setLocalStorage(STORAGE_KEYS.MEDITATION_SCRIPTS, updatedScripts);
      set({ meditationScripts: updatedScripts });
    }
  },
  
  updateScript: (id, updates) => {
    const { meditationScripts } = get();
    const updatedScripts = meditationScripts.map(script =>
      script.id === id ? { ...script, ...updates } : script
    );
    
    setLocalStorage(STORAGE_KEYS.MEDITATION_SCRIPTS, updatedScripts);
    set({ meditationScripts: updatedScripts });
  },
}));
