import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MaterialItem, Recommender, RecommendationRequest } from "@/types";
import { mockMaterials, mockRecommenders } from "@/data/mockData";
import { generateId } from "@/utils/storage";
import { today } from "@/utils/date";

interface MaterialState {
  materials: MaterialItem[];
  recommenders: Recommender[];
  addMaterial: (material: Omit<MaterialItem, "id">) => void;
  updateMaterial: (id: string, updates: Partial<MaterialItem>) => void;
  deleteMaterial: (id: string) => void;
  markMaterialSubmitted: (id: string) => void;
  addRecommender: (rec: Omit<Recommender, "id" | "requests">) => void;
  updateRecommender: (id: string, updates: Partial<Recommender>) => void;
  deleteRecommender: (id: string) => void;
  addRecommendationRequest: (
    recommenderId: string,
    request: Omit<RecommendationRequest, "id" | "recommenderId">
  ) => void;
  updateRecommendationRequest: (
    recommenderId: string,
    requestId: string,
    updates: Partial<RecommendationRequest>
  ) => void;
  deleteRecommendationRequest: (
    recommenderId: string,
    requestId: string
  ) => void;
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set) => ({
      materials: mockMaterials,
      recommenders: mockRecommenders,

      addMaterial: (material) =>
        set((state) => ({
          materials: [...state.materials, { ...material, id: generateId() }],
        })),

      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        })),

      markMaterialSubmitted: (id) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id
              ? { ...m, status: "submitted", submittedAt: today() }
              : m
          ),
        })),

      addRecommender: (rec) =>
        set((state) => ({
          recommenders: [
            ...state.recommenders,
            { ...rec, id: generateId(), requests: [] },
          ],
        })),

      updateRecommender: (id, updates) =>
        set((state) => ({
          recommenders: state.recommenders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRecommender: (id) =>
        set((state) => ({
          recommenders: state.recommenders.filter((r) => r.id !== id),
        })),

      addRecommendationRequest: (recommenderId, request) =>
        set((state) => ({
          recommenders: state.recommenders.map((r) =>
            r.id === recommenderId
              ? {
                  ...r,
                  requests: [
                    ...r.requests,
                    {
                      ...request,
                      id: generateId(),
                      recommenderId,
                    },
                  ],
                }
              : r
          ),
        })),

      updateRecommendationRequest: (recommenderId, requestId, updates) =>
        set((state) => ({
          recommenders: state.recommenders.map((r) =>
            r.id === recommenderId
              ? {
                  ...r,
                  requests: r.requests.map((req) =>
                    req.id === requestId ? { ...req, ...updates } : req
                  ),
                }
              : r
          ),
        })),

      deleteRecommendationRequest: (recommenderId, requestId) =>
        set((state) => ({
          recommenders: state.recommenders.map((r) =>
            r.id === recommenderId
              ? {
                  ...r,
                  requests: r.requests.filter((req) => req.id !== requestId),
                }
              : r
          ),
        })),
    }),
    {
      name: "study-app-materials",
    }
  )
);
