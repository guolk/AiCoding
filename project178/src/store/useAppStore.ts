import { create } from 'zustand'
import type {
  AppState,
  KnowledgeDomain,
  KnowledgeArea,
  QuarterlyOKR,
  KeyResult,
  LearningResource,
  LearningTime,
  Assessment,
  OutputItem,
  UseCase,
} from '@/types'
import {
  mockDomains,
  mockAreas,
  mockOKRs,
  mockKeyResults,
  mockResources,
  mockLearningTimes,
  mockAssessments,
  mockOutputs,
  mockUseCases,
} from '@/data/mockData'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error('Error loading from storage:', e)
  }
  return fallback
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Error saving to storage:', e)
  }
}

const useAppStore = create<AppState & {
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  setCurrentQuarter: (q: string) => void

  addDomain: (d: KnowledgeDomain) => void
  updateDomain: (id: string, u: Partial<KnowledgeDomain>) => void
  deleteDomain: (id: string) => void

  addArea: (a: KnowledgeArea) => void
  updateArea: (id: string, u: Partial<KnowledgeArea>) => void
  deleteArea: (id: string) => void

  addOKR: (o: QuarterlyOKR) => void
  updateOKR: (id: string, u: Partial<QuarterlyOKR>) => void
  deleteOKR: (id: string) => void

  addKeyResult: (kr: KeyResult) => void
  updateKeyResult: (id: string, u: Partial<KeyResult>) => void
  deleteKeyResult: (id: string) => void
  updateKRProgress: (id: string, currentValue: number) => void

  addResource: (r: LearningResource) => void
  updateResource: (id: string, u: Partial<LearningResource>) => void
  deleteResource: (id: string) => void
  updateResourceStatus: (id: string, status: LearningResource['status']) => void

  addLearningTime: (lt: LearningTime) => void
  updateLearningTime: (id: string, u: Partial<LearningTime>) => void

  addAssessment: (a: Assessment) => void
  updateAssessment: (id: string, u: Partial<Assessment>) => void
  deleteAssessment: (id: string) => void

  addOutput: (o: OutputItem) => void
  updateOutput: (id: string, u: Partial<OutputItem>) => void
  deleteOutput: (id: string) => void

  addUseCase: (uc: UseCase) => void
  updateUseCase: (id: string, u: Partial<UseCase>) => void
  deleteUseCase: (id: string) => void
}>((set, get) => {
  const initial: AppState = {
    domains: loadFromStorage('okr-domains', mockDomains),
    areas: loadFromStorage('okr-areas', mockAreas),
    okrs: loadFromStorage('okr-okrs', mockOKRs),
    keyResults: loadFromStorage('okr-keyResults', mockKeyResults),
    resources: loadFromStorage('okr-resources', mockResources),
    learningTimes: loadFromStorage('okr-learningTimes', mockLearningTimes),
    assessments: loadFromStorage('okr-assessments', mockAssessments),
    outputs: loadFromStorage('okr-outputs', mockOutputs),
    useCases: loadFromStorage('okr-useCases', mockUseCases),
    currentQuarter: loadFromStorage('okr-currentQuarter', '2026-Q2'),
    sidebarCollapsed: loadFromStorage('okr-sidebarCollapsed', false),
  }

  const persist = (state: Partial<AppState>) => {
    const full = { ...get(), ...state }
    saveToStorage('okr-domains', full.domains)
    saveToStorage('okr-areas', full.areas)
    saveToStorage('okr-okrs', full.okrs)
    saveToStorage('okr-keyResults', full.keyResults)
    saveToStorage('okr-resources', full.resources)
    saveToStorage('okr-learningTimes', full.learningTimes)
    saveToStorage('okr-assessments', full.assessments)
    saveToStorage('okr-outputs', full.outputs)
    saveToStorage('okr-useCases', full.useCases)
    saveToStorage('okr-currentQuarter', full.currentQuarter)
    saveToStorage('okr-sidebarCollapsed', full.sidebarCollapsed)
  }

  return {
    ...initial,

    setSidebarCollapsed: (v) => {
      const next = { sidebarCollapsed: v }
      persist(next)
      set(next)
    },
    toggleSidebar: () => {
      const next = { sidebarCollapsed: !get().sidebarCollapsed }
      persist(next)
      set(next)
    },
    setCurrentQuarter: (q) => {
      const next = { currentQuarter: q }
      persist(next)
      set(next)
    },

    addDomain: (d) => { set({ domains: [...get().domains, d] }); persist({ domains: [...get().domains, d] }) },
    updateDomain: (id, u) => { const domains = get().domains.map(x => x.id === id ? { ...x, ...u } : x); set({ domains }); persist({ domains }) },
    deleteDomain: (id) => { const domains = get().domains.filter(x => x.id !== id); set({ domains }); persist({ domains }) },

    addArea: (a) => { const areas = [...get().areas, a]; set({ areas }); persist({ areas }) },
    updateArea: (id, u) => { const areas = get().areas.map(x => x.id === id ? { ...x, ...u } : x); set({ areas }); persist({ areas }) },
    deleteArea: (id) => { const areas = get().areas.filter(x => x.id !== id); set({ areas }); persist({ areas }) },

    addOKR: (o) => { const okrs = [...get().okrs, o]; set({ okrs }); persist({ okrs }) },
    updateOKR: (id, u) => { const okrs = get().okrs.map(x => x.id === id ? { ...x, ...u } : x); set({ okrs }); persist({ okrs }) },
    deleteOKR: (id) => { const okrs = get().okrs.filter(x => x.id !== id); set({ okrs }); persist({ okrs }) },

    addKeyResult: (kr) => { const keyResults = [...get().keyResults, kr]; set({ keyResults }); persist({ keyResults }) },
    updateKeyResult: (id, u) => { const keyResults = get().keyResults.map(x => x.id === id ? { ...x, ...u } : x); set({ keyResults }); persist({ keyResults }) },
    deleteKeyResult: (id) => { const keyResults = get().keyResults.filter(x => x.id !== id); set({ keyResults }); persist({ keyResults }) },
    updateKRProgress: (id, currentValue) => { const keyResults = get().keyResults.map(x => x.id === id ? { ...x, currentValue } : x); set({ keyResults }); persist({ keyResults }) },

    addResource: (r) => { const resources = [...get().resources, r]; set({ resources }); persist({ resources }) },
    updateResource: (id, u) => { const resources = get().resources.map(x => x.id === id ? { ...x, ...u } : x); set({ resources }); persist({ resources }) },
    deleteResource: (id) => { const resources = get().resources.filter(x => x.id !== id); set({ resources }); persist({ resources }) },
    updateResourceStatus: (id, status) => { const resources = get().resources.map(x => x.id === id ? { ...x, status } : x); set({ resources }); persist({ resources }) },

    addLearningTime: (lt) => { const learningTimes = [...get().learningTimes, lt]; set({ learningTimes }); persist({ learningTimes }) },
    updateLearningTime: (id, u) => { const learningTimes = get().learningTimes.map(x => x.id === id ? { ...x, ...u } : x); set({ learningTimes }); persist({ learningTimes }) },

    addAssessment: (a) => { const assessments = [...get().assessments, a]; set({ assessments }); persist({ assessments }) },
    updateAssessment: (id, u) => { const assessments = get().assessments.map(x => x.id === id ? { ...x, ...u } : x); set({ assessments }); persist({ assessments }) },
    deleteAssessment: (id) => { const assessments = get().assessments.filter(x => x.id !== id); set({ assessments }); persist({ assessments }) },

    addOutput: (o) => { const outputs = [...get().outputs, o]; set({ outputs }); persist({ outputs }) },
    updateOutput: (id, u) => { const outputs = get().outputs.map(x => x.id === id ? { ...x, ...u } : x); set({ outputs }); persist({ outputs }) },
    deleteOutput: (id) => { const outputs = get().outputs.filter(x => x.id !== id); set({ outputs }); persist({ outputs }) },

    addUseCase: (uc) => { const useCases = [...get().useCases, uc]; set({ useCases }); persist({ useCases }) },
    updateUseCase: (id, u) => { const useCases = get().useCases.map(x => x.id === id ? { ...x, ...u } : x); set({ useCases }); persist({ useCases }) },
    deleteUseCase: (id) => { const useCases = get().useCases.filter(x => x.id !== id); set({ useCases }); persist({ useCases }) },
  }
})

export default useAppStore
