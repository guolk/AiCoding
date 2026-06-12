import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DocumentItem,
  DocumentVersion,
  KeyPoint,
  DocumentTimeline,
} from "@/types";
import { mockDocuments } from "@/data/mockData";
import { generateId } from "@/utils/storage";
import { today } from "@/utils/date";

interface DocumentState {
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  addDocument: (doc: Omit<DocumentItem, "id" | "createdAt" | "versions">) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  selectDocument: (id: string | null) => void;
  addVersion: (documentId: string, version: Omit<DocumentVersion, "id">) => void;
  updateVersion: (
    documentId: string,
    versionId: string,
    updates: Partial<DocumentVersion>
  ) => void;
  toggleKeyPoint: (documentId: string, keyPointId: string) => void;
  addKeyPoint: (documentId: string, keyPoint: Omit<KeyPoint, "id">) => void;
  deleteKeyPoint: (documentId: string, keyPointId: string) => void;
  updateTimeline: (
    documentId: string,
    timelineId: string,
    updates: Partial<DocumentTimeline>
  ) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      documents: mockDocuments,
      selectedDocumentId: null,

      addDocument: (doc) =>
        set((state) => {
          const newId = generateId();
          return {
            documents: [
              ...state.documents,
              {
                ...doc,
                id: newId,
                createdAt: today(),
                versions: [],
              },
            ],
            selectedDocumentId: newId,
          };
        }),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          selectedDocumentId:
            state.selectedDocumentId === id ? null : state.selectedDocumentId,
        })),

      selectDocument: (id) => set({ selectedDocumentId: id }),

      addVersion: (documentId, version) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  versions: [...d.versions, { ...version, id: generateId() }],
                  currentVersionId: version.status === "final" ? generateId() : d.currentVersionId,
                }
              : d
          ),
        })),

      updateVersion: (documentId, versionId, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  versions: d.versions.map((v) =>
                    v.id === versionId ? { ...v, ...updates } : v
                  ),
                }
              : d
          ),
        })),

      toggleKeyPoint: (documentId, keyPointId) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  keyPoints: d.keyPoints.map((k) =>
                    k.id === keyPointId ? { ...k, isChecked: !k.isChecked } : k
                  ),
                }
              : d
          ),
        })),

      addKeyPoint: (documentId, keyPoint) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  keyPoints: [...d.keyPoints, { ...keyPoint, id: generateId() }],
                }
              : d
          ),
        })),

      deleteKeyPoint: (documentId, keyPointId) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  keyPoints: d.keyPoints.filter((k) => k.id !== keyPointId),
                }
              : d
          ),
        })),

      updateTimeline: (documentId, timelineId, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId
              ? {
                  ...d,
                  timeline: d.timeline.map((t) =>
                    t.id === timelineId ? { ...t, ...updates } : t
                  ),
                }
              : d
          ),
        })),
    }),
    {
      name: "study-app-documents",
    }
  )
);
