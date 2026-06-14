import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Specimen,
  Supplier,
  AcquisitionRecord,
  ScientificData,
  DisplayLocation,
  DisplayPlacement,
  LoanRecord,
  KnowledgeNote,
} from '@/types';
import {
  mockSpecimens,
  mockSuppliers,
  mockAcquisitionRecords,
  mockScientificData,
  mockDisplayLocations,
  mockDisplayPlacements,
  mockLoanRecords,
  mockKnowledgeNotes,
} from '@/data/mockData';
import { generateId, getNowISO } from '@/utils/dateUtils';

interface AppState {
  specimens: Specimen[];
  suppliers: Supplier[];
  acquisitionRecords: AcquisitionRecord[];
  scientificData: ScientificData[];
  displayLocations: DisplayLocation[];
  displayPlacements: DisplayPlacement[];
  loanRecords: LoanRecord[];
  knowledgeNotes: KnowledgeNote[];

  addSpecimen: (spec: Omit<Specimen, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSpecimen: (id: string, spec: Partial<Specimen>) => void;
  deleteSpecimen: (id: string) => void;

  addSupplier: (sup: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addAcquisitionRecord: (rec: Omit<AcquisitionRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAcquisitionRecord: (id: string, rec: Partial<AcquisitionRecord>) => void;
  deleteAcquisitionRecord: (id: string) => void;

  addScientificData: (data: Omit<ScientificData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateScientificData: (id: string, data: Partial<ScientificData>) => void;
  deleteScientificData: (id: string) => void;

  addDisplayLocation: (loc: Omit<DisplayLocation, 'id'>) => void;
  updateDisplayLocation: (id: string, loc: Partial<DisplayLocation>) => void;
  deleteDisplayLocation: (id: string) => void;

  addDisplayPlacement: (dpl: Omit<DisplayPlacement, 'id' | 'placedAt' | 'updatedAt'>) => void;
  updateDisplayPlacement: (id: string, dpl: Partial<DisplayPlacement>) => void;
  deleteDisplayPlacement: (id: string) => void;

  addLoanRecord: (loan: Omit<LoanRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLoanRecord: (id: string, loan: Partial<LoanRecord>) => void;
  deleteLoanRecord: (id: string) => void;

  addKnowledgeNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateKnowledgeNote: (id: string, note: Partial<KnowledgeNote>) => void;
  deleteKnowledgeNote: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      specimens: mockSpecimens,
      suppliers: mockSuppliers,
      acquisitionRecords: mockAcquisitionRecords,
      scientificData: mockScientificData,
      displayLocations: mockDisplayLocations,
      displayPlacements: mockDisplayPlacements,
      loanRecords: mockLoanRecords,
      knowledgeNotes: mockKnowledgeNotes,

      addSpecimen: (spec) =>
        set((state) => ({
          specimens: [
            ...state.specimens,
            { ...spec, id: generateId(), createdAt: getNowISO(), updatedAt: getNowISO() } as Specimen,
          ],
        })),
      updateSpecimen: (id, spec) =>
        set((state) => ({
          specimens: state.specimens.map((s) =>
            s.id === id ? ({ ...s, ...spec, updatedAt: getNowISO() } as Specimen) : s
          ),
        })),
      deleteSpecimen: (id) =>
        set((state) => ({
          specimens: state.specimens.filter((s) => s.id !== id),
          acquisitionRecords: state.acquisitionRecords.filter((r) => r.specimenId !== id),
          scientificData: state.scientificData.filter((d) => d.specimenId !== id),
          displayPlacements: state.displayPlacements.filter((d) => d.specimenId !== id),
          loanRecords: state.loanRecords.map((l) => ({
            ...l,
            specimenIds: l.specimenIds.filter((sid) => sid !== id),
          })),
        })),

      addSupplier: (sup) =>
        set((state) => ({
          suppliers: [...state.suppliers, { ...sup, id: generateId(), createdAt: getNowISO() }],
        })),
      updateSupplier: (id, sup) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...sup } : s)),
        })),
      deleteSupplier: (id) =>
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        })),

      addAcquisitionRecord: (rec) =>
        set((state) => ({
          acquisitionRecords: [
            ...state.acquisitionRecords,
            { ...rec, id: generateId(), createdAt: getNowISO(), updatedAt: getNowISO() },
          ],
        })),
      updateAcquisitionRecord: (id, rec) =>
        set((state) => ({
          acquisitionRecords: state.acquisitionRecords.map((r) =>
            r.id === id ? { ...r, ...rec, updatedAt: getNowISO() } : r
          ),
        })),
      deleteAcquisitionRecord: (id) =>
        set((state) => ({
          acquisitionRecords: state.acquisitionRecords.filter((r) => r.id !== id),
        })),

      addScientificData: (data) =>
        set((state) => ({
          scientificData: [
            ...state.scientificData,
            { ...data, id: generateId(), createdAt: getNowISO(), updatedAt: getNowISO() },
          ],
        })),
      updateScientificData: (id, data) =>
        set((state) => ({
          scientificData: state.scientificData.map((d) =>
            d.id === id ? { ...d, ...data, updatedAt: getNowISO() } : d
          ),
        })),
      deleteScientificData: (id) =>
        set((state) => ({
          scientificData: state.scientificData.filter((d) => d.id !== id),
        })),

      addDisplayLocation: (loc) =>
        set((state) => ({
          displayLocations: [...state.displayLocations, { ...loc, id: generateId() }],
        })),
      updateDisplayLocation: (id, loc) =>
        set((state) => ({
          displayLocations: state.displayLocations.map((l) =>
            l.id === id ? { ...l, ...loc } : l
          ),
        })),
      deleteDisplayLocation: (id) =>
        set((state) => ({
          displayLocations: state.displayLocations.filter((l) => l.id !== id),
          displayPlacements: state.displayPlacements.filter((d) => d.locationId !== id),
        })),

      addDisplayPlacement: (dpl) =>
        set((state) => ({
          displayPlacements: [
            ...state.displayPlacements,
            { ...dpl, id: generateId(), placedAt: getNowISO(), updatedAt: getNowISO() },
          ],
        })),
      updateDisplayPlacement: (id, dpl) =>
        set((state) => ({
          displayPlacements: state.displayPlacements.map((d) =>
            d.id === id ? { ...d, ...dpl, updatedAt: getNowISO() } : d
          ),
        })),
      deleteDisplayPlacement: (id) =>
        set((state) => ({
          displayPlacements: state.displayPlacements.filter((d) => d.id !== id),
        })),

      addLoanRecord: (loan) =>
        set((state) => ({
          loanRecords: [
            ...state.loanRecords,
            { ...loan, id: generateId(), createdAt: getNowISO(), updatedAt: getNowISO() },
          ],
        })),
      updateLoanRecord: (id, loan) =>
        set((state) => ({
          loanRecords: state.loanRecords.map((l) =>
            l.id === id ? { ...l, ...loan, updatedAt: getNowISO() } : l
          ),
        })),
      deleteLoanRecord: (id) =>
        set((state) => ({
          loanRecords: state.loanRecords.filter((l) => l.id !== id),
        })),

      addKnowledgeNote: (note) =>
        set((state) => ({
          knowledgeNotes: [
            ...state.knowledgeNotes,
            { ...note, id: generateId(), createdAt: getNowISO(), updatedAt: getNowISO() },
          ],
        })),
      updateKnowledgeNote: (id, note) =>
        set((state) => ({
          knowledgeNotes: state.knowledgeNotes.map((n) =>
            n.id === id ? { ...n, ...note, updatedAt: getNowISO() } : n
          ),
        })),
      deleteKnowledgeNote: (id) =>
        set((state) => ({
          knowledgeNotes: state.knowledgeNotes.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'mineral-collection-storage',
      partialize: (state) => ({
        specimens: state.specimens,
        suppliers: state.suppliers,
        acquisitionRecords: state.acquisitionRecords,
        scientificData: state.scientificData,
        displayLocations: state.displayLocations,
        displayPlacements: state.displayPlacements,
        loanRecords: state.loanRecords,
        knowledgeNotes: state.knowledgeNotes,
      }),
    }
  )
);
