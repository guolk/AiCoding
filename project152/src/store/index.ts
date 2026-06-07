import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Patent,
  Trademark,
  Copyright,
  CompetitorPatent,
  InfringementAssessment,
  LicenseAgreement,
  TechnologyTransfer,
  PledgeFinancing,
  PatentValuation,
} from '@/types';
import {
  generateMockPatents,
  generateMockTrademarks,
  generateMockCopyrights,
  generateMockCompetitorPatents,
  generateMockInfringementAssessments,
  generateMockLicenseAgreements,
  generateMockTechnologyTransfers,
  generateMockPledgeFinancings,
  generateMockPatentValuations,
} from '@/utils/mockData';
import { generateId } from '@/utils/formatters';
import { generateAnnuitySchedule } from '@/utils/annuityCalc';

interface AppState {
  patents: Patent[];
  trademarks: Trademark[];
  copyrights: Copyright[];
  competitorPatents: CompetitorPatent[];
  infringementAssessments: InfringementAssessment[];
  licenseAgreements: LicenseAgreement[];
  technologyTransfers: TechnologyTransfer[];
  pledgeFinancings: PledgeFinancing[];
  patentValuations: PatentValuation[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  initMockData: () => void;

  addPatent: (patent: Omit<Patent, 'id' | 'createdAt' | 'updatedAt' | 'annuityRecords'>) => void;
  updatePatent: (id: string, updates: Partial<Patent>) => void;
  deletePatent: (id: string) => void;
  getPatentById: (id: string) => Patent | undefined;
  updatePatentStatus: (id: string, status: Patent['status'], note: string) => void;
  updateAnnuityRecord: (patentId: string, recordId: string, updates: Partial<Patent['annuityRecords'][0]>) => void;

  addTrademark: (trademark: Omit<Trademark, 'id' | 'createdAt'>) => void;
  updateTrademark: (id: string, updates: Partial<Trademark>) => void;
  deleteTrademark: (id: string) => void;

  addCopyright: (copyright: Omit<Copyright, 'id' | 'createdAt'>) => void;
  updateCopyright: (id: string, updates: Partial<Copyright>) => void;
  deleteCopyright: (id: string) => void;

  addCompetitorPatent: (patent: Omit<CompetitorPatent, 'id'>) => void;
  updateCompetitorPatent: (id: string, updates: Partial<CompetitorPatent>) => void;
  deleteCompetitorPatent: (id: string) => void;

  addInfringementAssessment: (assessment: Omit<InfringementAssessment, 'id'>) => void;
  updateInfringementAssessment: (id: string, updates: Partial<InfringementAssessment>) => void;
  deleteInfringementAssessment: (id: string) => void;

  addLicenseAgreement: (agreement: Omit<LicenseAgreement, 'id'>) => void;
  updateLicenseAgreement: (id: string, updates: Partial<LicenseAgreement>) => void;
  deleteLicenseAgreement: (id: string) => void;

  addTechnologyTransfer: (transfer: Omit<TechnologyTransfer, 'id'>) => void;
  updateTechnologyTransfer: (id: string, updates: Partial<TechnologyTransfer>) => void;
  deleteTechnologyTransfer: (id: string) => void;

  addPledgeFinancing: (financing: Omit<PledgeFinancing, 'id'>) => void;
  updatePledgeFinancing: (id: string, updates: Partial<PledgeFinancing>) => void;
  deletePledgeFinancing: (id: string) => void;

  addPatentValuation: (valuation: Omit<PatentValuation, 'id'>) => void;
  updatePatentValuation: (id: string, updates: Partial<PatentValuation>) => void;
  deletePatentValuation: (id: string) => void;

  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      patents: [],
      trademarks: [],
      copyrights: [],
      competitorPatents: [],
      infringementAssessments: [],
      licenseAgreements: [],
      technologyTransfers: [],
      pledgeFinancings: [],
      patentValuations: [],
      loading: false,
      error: null,
      initialized: false,

      initMockData: () => {
        if (get().initialized) return;
        
        const patents = generateMockPatents();
        const competitorPatents = generateMockCompetitorPatents();
        
        set({
          patents,
          trademarks: generateMockTrademarks(),
          copyrights: generateMockCopyrights(),
          competitorPatents,
          infringementAssessments: generateMockInfringementAssessments(patents, competitorPatents),
          licenseAgreements: generateMockLicenseAgreements(patents),
          technologyTransfers: generateMockTechnologyTransfers(patents),
          pledgeFinancings: generateMockPledgeFinancings(patents),
          patentValuations: generateMockPatentValuations(patents),
          initialized: true,
        });
      },

      addPatent: (patent) => {
        const now = new Date().toISOString();
        const annuityRecords = generateAnnuitySchedule(patent.applicationDate, patent.patentType, 20);
        const newPatent: Patent = {
          ...patent,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          annuityRecords,
        };
        set((state) => ({ patents: [...state.patents, newPatent] }));
      },

      updatePatent: (id, updates) => {
        set((state) => ({
          patents: state.patents.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePatent: (id) => {
        set((state) => ({
          patents: state.patents.filter((p) => p.id !== id),
        }));
      },

      getPatentById: (id) => {
        return get().patents.find((p) => p.id === id);
      },

      updatePatentStatus: (id, status, note) => {
        const now = new Date().toISOString();
        set((state) => ({
          patents: state.patents.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  updatedAt: now,
                  statusHistory: [
                    ...p.statusHistory,
                    { id: generateId(), status, date: now, note },
                  ],
                }
              : p
          ),
        }));
      },

      updateAnnuityRecord: (patentId, recordId, updates) => {
        set((state) => ({
          patents: state.patents.map((p) =>
            p.id === patentId
              ? {
                  ...p,
                  annuityRecords: p.annuityRecords.map((r) =>
                    r.id === recordId ? { ...r, ...updates } : r
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      addTrademark: (trademark) => {
        const newTrademark: Trademark = {
          ...trademark,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ trademarks: [...state.trademarks, newTrademark] }));
      },

      updateTrademark: (id, updates) => {
        set((state) => ({
          trademarks: state.trademarks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTrademark: (id) => {
        set((state) => ({
          trademarks: state.trademarks.filter((t) => t.id !== id),
        }));
      },

      addCopyright: (copyright) => {
        const newCopyright: Copyright = {
          ...copyright,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ copyrights: [...state.copyrights, newCopyright] }));
      },

      updateCopyright: (id, updates) => {
        set((state) => ({
          copyrights: state.copyrights.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCopyright: (id) => {
        set((state) => ({
          copyrights: state.copyrights.filter((c) => c.id !== id),
        }));
      },

      addCompetitorPatent: (patent) => {
        const newPatent: CompetitorPatent = {
          ...patent,
          id: generateId(),
        };
        set((state) => ({ competitorPatents: [...state.competitorPatents, newPatent] }));
      },

      updateCompetitorPatent: (id, updates) => {
        set((state) => ({
          competitorPatents: state.competitorPatents.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteCompetitorPatent: (id) => {
        set((state) => ({
          competitorPatents: state.competitorPatents.filter((p) => p.id !== id),
        }));
      },

      addInfringementAssessment: (assessment) => {
        const newAssessment: InfringementAssessment = {
          ...assessment,
          id: generateId(),
        };
        set((state) => ({ infringementAssessments: [...state.infringementAssessments, newAssessment] }));
      },

      updateInfringementAssessment: (id, updates) => {
        set((state) => ({
          infringementAssessments: state.infringementAssessments.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteInfringementAssessment: (id) => {
        set((state) => ({
          infringementAssessments: state.infringementAssessments.filter((a) => a.id !== id),
        }));
      },

      addLicenseAgreement: (agreement) => {
        const newAgreement: LicenseAgreement = {
          ...agreement,
          id: generateId(),
        };
        set((state) => ({ licenseAgreements: [...state.licenseAgreements, newAgreement] }));
      },

      updateLicenseAgreement: (id, updates) => {
        set((state) => ({
          licenseAgreements: state.licenseAgreements.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteLicenseAgreement: (id) => {
        set((state) => ({
          licenseAgreements: state.licenseAgreements.filter((a) => a.id !== id),
        }));
      },

      addTechnologyTransfer: (transfer) => {
        const newTransfer: TechnologyTransfer = {
          ...transfer,
          id: generateId(),
        };
        set((state) => ({ technologyTransfers: [...state.technologyTransfers, newTransfer] }));
      },

      updateTechnologyTransfer: (id, updates) => {
        set((state) => ({
          technologyTransfers: state.technologyTransfers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTechnologyTransfer: (id) => {
        set((state) => ({
          technologyTransfers: state.technologyTransfers.filter((t) => t.id !== id),
        }));
      },

      addPledgeFinancing: (financing) => {
        const newFinancing: PledgeFinancing = {
          ...financing,
          id: generateId(),
        };
        set((state) => ({ pledgeFinancings: [...state.pledgeFinancings, newFinancing] }));
      },

      updatePledgeFinancing: (id, updates) => {
        set((state) => ({
          pledgeFinancings: state.pledgeFinancings.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },

      deletePledgeFinancing: (id) => {
        set((state) => ({
          pledgeFinancings: state.pledgeFinancings.filter((f) => f.id !== id),
        }));
      },

      addPatentValuation: (valuation) => {
        const newValuation: PatentValuation = {
          ...valuation,
          id: generateId(),
        };
        set((state) => ({ patentValuations: [...state.patentValuations, newValuation] }));
      },

      updatePatentValuation: (id, updates) => {
        set((state) => ({
          patentValuations: state.patentValuations.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        }));
      },

      deletePatentValuation: (id) => {
        set((state) => ({
          patentValuations: state.patentValuations.filter((v) => v.id !== id),
        }));
      },

      clearAllData: () => {
        set({
          patents: [],
          trademarks: [],
          copyrights: [],
          competitorPatents: [],
          infringementAssessments: [],
          licenseAgreements: [],
          technologyTransfers: [],
          pledgeFinancings: [],
          patentValuations: [],
          initialized: false,
        });
      },
    }),
    {
      name: 'ip-management-storage',
    }
  )
);
