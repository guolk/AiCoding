import { create } from "zustand";
import { persist } from "zustand/middleware";
import { University } from "@/types";
import { mockUniversities } from "@/data/mockData";

interface ApplicationState {
  universities: University[];
  selectedUniversityId: string | null;
  addUniversity: (uni: Omit<University, "id">) => void;
  updateUniversity: (id: string, updates: Partial<University>) => void;
  deleteUniversity: (id: string) => void;
  selectUniversity: (id: string | null) => void;
  updateStageProgress: (
    universityId: string,
    stageId: string,
    progress: number,
    isCompleted: boolean
  ) => void;
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      universities: mockUniversities,
      selectedUniversityId: null,

      addUniversity: (uni) =>
        set((state) => ({
          universities: [
            ...state.universities,
            { ...uni, id: Date.now().toString(36) },
          ],
        })),

      updateUniversity: (id, updates) =>
        set((state) => ({
          universities: state.universities.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        })),

      deleteUniversity: (id) =>
        set((state) => ({
          universities: state.universities.filter((u) => u.id !== id),
          selectedUniversityId:
            state.selectedUniversityId === id ? null : state.selectedUniversityId,
        })),

      selectUniversity: (id) => set({ selectedUniversityId: id }),

      updateStageProgress: (universityId, stageId, progress, isCompleted) =>
        set((state) => ({
          universities: state.universities.map((u) =>
            u.id === universityId
              ? {
                  ...u,
                  stages: u.stages.map((s) =>
                    s.id === stageId ? { ...s, progress, isCompleted } : s
                  ),
                }
              : u
          ),
        })),
    }),
    {
      name: "study-app-applications",
    }
  )
);
