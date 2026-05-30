import { create } from 'zustand';
import { YogaSequence, TargetGoal, PoseSequenceItem } from '@/types';
import { defaultSequences, getBuiltInSequences, getCustomSequences, getSequencesByGoal } from '@/data/sequences';
import { getLocalStorage, setLocalStorage, STORAGE_KEYS } from '@/utils/storage';
import { generateId } from '@/utils';

interface SequenceStore {
  sequences: YogaSequence[];
  currentSequence: YogaSequence | null;
  editingSequence: YogaSequence | null;
  
  loadSequences: () => void;
  setCurrentSequence: (sequence: YogaSequence | null) => void;
  startEditing: (sequence?: YogaSequence) => void;
  updateEditingSequence: (updates: Partial<YogaSequence>) => void;
  addPoseToEditing: (pose: PoseSequenceItem) => void;
  removePoseFromEditing: (index: number) => void;
  reorderPosesInEditing: (fromIndex: number, toIndex: number) => void;
  updatePoseDurationInEditing: (index: number, duration: number) => void;
  saveEditingSequence: () => void;
  deleteSequence: (id: string) => void;
  getBuiltIn: () => YogaSequence[];
  getCustom: () => YogaSequence[];
  getByGoal: (goal: TargetGoal) => YogaSequence[];
  getById: (id: string) => YogaSequence | undefined;
}

export const useSequenceStore = create<SequenceStore>((set, get) => ({
  sequences: defaultSequences,
  currentSequence: null,
  editingSequence: null,
  
  loadSequences: () => {
    const savedSequences = getLocalStorage<YogaSequence[]>(STORAGE_KEYS.SEQUENCES, []);
    const allSequences = [...defaultSequences, ...savedSequences.filter(s => !defaultSequences.find(ds => ds.id === s.id))];
    set({ sequences: allSequences });
  },
  
  setCurrentSequence: (sequence) => {
    set({ currentSequence: sequence });
  },
  
  startEditing: (sequence) => {
    if (sequence) {
      set({ editingSequence: JSON.parse(JSON.stringify(sequence)) });
    } else {
      set({
        editingSequence: {
          id: generateId(),
          name: '',
          description: '',
          type: 'custom',
          targetGoal: 'relaxation',
          totalDuration: 0,
          poses: [],
          isBuiltIn: false,
          createdAt: new Date().toISOString(),
        }
      });
    }
  },
  
  updateEditingSequence: (updates) => {
    const { editingSequence } = get();
    if (editingSequence) {
      const updated = { ...editingSequence, ...updates };
      updated.totalDuration = updated.poses.reduce((sum, pose) => sum + pose.duration, 0);
      set({ editingSequence: updated });
    }
  },
  
  addPoseToEditing: (pose) => {
    const { editingSequence } = get();
    if (editingSequence) {
      const updatedPoses = [...editingSequence.poses, pose];
      const totalDuration = updatedPoses.reduce((sum, p) => sum + p.duration, 0);
      set({
        editingSequence: {
          ...editingSequence,
          poses: updatedPoses,
          totalDuration
        }
      });
    }
  },
  
  removePoseFromEditing: (index) => {
    const { editingSequence } = get();
    if (editingSequence) {
      const updatedPoses = editingSequence.poses.filter((_, i) => i !== index);
      const totalDuration = updatedPoses.reduce((sum, p) => sum + p.duration, 0);
      set({
        editingSequence: {
          ...editingSequence,
          poses: updatedPoses,
          totalDuration
        }
      });
    }
  },
  
  reorderPosesInEditing: (fromIndex, toIndex) => {
    const { editingSequence } = get();
    if (editingSequence) {
      const updatedPoses = [...editingSequence.poses];
      const [moved] = updatedPoses.splice(fromIndex, 1);
      updatedPoses.splice(toIndex, 0, moved);
      set({
        editingSequence: {
          ...editingSequence,
          poses: updatedPoses
        }
      });
    }
  },
  
  updatePoseDurationInEditing: (index, duration) => {
    const { editingSequence } = get();
    if (editingSequence && editingSequence.poses[index]) {
      const updatedPoses = [...editingSequence.poses];
      updatedPoses[index] = { ...updatedPoses[index], duration };
      const totalDuration = updatedPoses.reduce((sum, p) => sum + p.duration, 0);
      set({
        editingSequence: {
          ...editingSequence,
          poses: updatedPoses,
          totalDuration
        }
      });
    }
  },
  
  saveEditingSequence: () => {
    const { editingSequence, sequences } = get();
    if (!editingSequence || !editingSequence.name.trim()) return;
    
    const sequenceToSave = {
      ...editingSequence,
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = sequences.findIndex(s => s.id === sequenceToSave.id);
    let updatedSequences: YogaSequence[];
    
    if (existingIndex >= 0) {
      updatedSequences = sequences.map((s, i) => i === existingIndex ? sequenceToSave : s);
    } else {
      updatedSequences = [...sequences, sequenceToSave];
    }
    
    const customSequences = updatedSequences.filter(s => !s.isBuiltIn);
    setLocalStorage(STORAGE_KEYS.SEQUENCES, customSequences);
    set({ sequences: updatedSequences, editingSequence: null });
  },
  
  deleteSequence: (id) => {
    const { sequences } = get();
    const sequence = sequences.find(s => s.id === id);
    
    if (sequence && !sequence.isBuiltIn) {
      const updatedSequences = sequences.filter(s => s.id !== id);
      const customSequences = updatedSequences.filter(s => !s.isBuiltIn);
      setLocalStorage(STORAGE_KEYS.SEQUENCES, customSequences);
      set({ sequences: updatedSequences });
    }
  },
  
  getBuiltIn: () => getBuiltInSequences(get().sequences),
  getCustom: () => getCustomSequences(get().sequences),
  getByGoal: (goal) => getSequencesByGoal(goal, get().sequences),
  getById: (id) => get().sequences.find(s => s.id === id),
}));
