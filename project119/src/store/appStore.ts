import { create } from 'zustand';
import { Paper, CitationRecord, CitationHistory, SocialMention, DownloadData, ApplicationCase, ImpactMetrics, ComparisonData } from '../../shared/types';

interface AppState {
  papers: Paper[];
  citations: CitationRecord[];
  citationHistory: CitationHistory[];
  socialMentions: SocialMention[];
  downloadData: DownloadData[];
  applicationCases: ApplicationCase[];
  impactMetrics: ImpactMetrics | null;
  comparisonData: ComparisonData | null;
  loading: boolean;
  error: string | null;
  
  fetchPapers: () => Promise<void>;
  addPaper: (paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePaper: (id: string, updates: Partial<Paper>) => Promise<void>;
  deletePaper: (id: string) => Promise<void>;
  syncPaperCitations: (id: string) => Promise<void>;
  
  fetchCitations: (paperId?: string) => Promise<void>;
  updateCitationCategory: (id: string, category: string) => Promise<void>;
  
  fetchCitationHistory: (paperId: string) => Promise<void>;
  fetchAllCitationHistory: () => Promise<void>;
  
  fetchImpactMetrics: () => Promise<void>;
  fetchComparisonData: () => Promise<void>;
  
  fetchSocialMentions: (paperId?: string) => Promise<void>;
  fetchAllSocialMentions: () => Promise<void>;
  fetchDownloadData: (paperId?: string) => Promise<void>;
  fetchAllDownloadData: () => Promise<void>;
  
  fetchApplicationCases: () => Promise<void>;
  addApplicationCase: (caseData: Omit<ApplicationCase, 'id' | 'createdAt'>) => Promise<void>;
  deleteApplicationCase: (id: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const API_BASE = '/api';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}

export const useAppStore = create<AppState>((set) => ({
  papers: [],
  citations: [],
  citationHistory: [],
  socialMentions: [],
  downloadData: [],
  applicationCases: [],
  impactMetrics: null,
  comparisonData: null,
  loading: false,
  error: null,
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  fetchPapers: async () => {
    set({ loading: true });
    try {
      const papers = await apiFetch<Paper[]>('/papers');
      set({ papers, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  addPaper: async (paper) => {
    set({ loading: true });
    try {
      const newPaper = await apiFetch<Paper>('/papers', {
        method: 'POST',
        body: JSON.stringify(paper),
      });
      set((state) => ({
        papers: [...state.papers, newPaper],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updatePaper: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedPaper = await apiFetch<Paper>(`/papers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      set((state) => ({
        papers: state.papers.map((p) => (p.id === id ? updatedPaper : p)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deletePaper: async (id) => {
    set({ loading: true });
    try {
      await apiFetch(`/papers/${id}`, { method: 'DELETE' });
      set((state) => ({
        papers: state.papers.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  syncPaperCitations: async (id) => {
    set({ loading: true });
    try {
      const result = await apiFetch<{ paper: Paper; citationHistory: CitationHistory[] }>(`/papers/${id}/sync`, {
        method: 'POST',
      });
      set((state) => ({
        papers: state.papers.map((p) => (p.id === id ? result.paper : p)),
        citationHistory: result.citationHistory,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchCitations: async (paperId) => {
    set({ loading: true });
    try {
      const endpoint = paperId ? `/citations?paperId=${paperId}` : '/citations';
      const citations = await apiFetch<CitationRecord[]>(endpoint);
      set({ citations, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updateCitationCategory: async (id, category) => {
    try {
      const updated = await apiFetch<CitationRecord>(`/citations/${id}/category`, {
        method: 'PUT',
        body: JSON.stringify({ category }),
      });
      set((state) => ({
        citations: state.citations.map((c) => (c.id === id ? updated : c)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  fetchCitationHistory: async (paperId) => {
    set({ loading: true });
    try {
      const history = await apiFetch<CitationHistory[]>(`/papers/${paperId}/citation-history`);
      set({ citationHistory: history, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchAllCitationHistory: async () => {
    try {
      await apiFetch<CitationHistory[]>('/impact/yearly-trend');
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  fetchImpactMetrics: async () => {
    set({ loading: true });
    try {
      const metrics = await apiFetch<ImpactMetrics>('/impact/metrics');
      set({ impactMetrics: metrics, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchComparisonData: async () => {
    set({ loading: true });
    try {
      const data = await apiFetch<ComparisonData>('/impact/comparison');
      set({ comparisonData: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchSocialMentions: async (paperId) => {
    if (paperId) {
      set({ loading: true });
      try {
        const mentions = await apiFetch<SocialMention[]>(`/papers/${paperId}/social-mentions`);
        set({ socialMentions: mentions, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    }
  },

  fetchAllSocialMentions: async () => {
    set({ loading: true });
    try {
      const mentions = await apiFetch<SocialMention[]>('/papers/social-mentions/all');
      set({ socialMentions: mentions, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchDownloadData: async (paperId) => {
    if (paperId) {
      set({ loading: true });
      try {
        const data = await apiFetch<DownloadData[]>(`/papers/${paperId}/downloads`);
        set({ downloadData: data, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    }
  },

  fetchAllDownloadData: async () => {
    set({ loading: true });
    try {
      const data = await apiFetch<DownloadData[]>('/papers/downloads/all');
      set({ downloadData: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchApplicationCases: async () => {
    set({ loading: true });
    try {
      const cases = await apiFetch<ApplicationCase[]>('/applications');
      set({ applicationCases: cases, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  addApplicationCase: async (caseData) => {
    set({ loading: true });
    try {
      const newCase = await apiFetch<ApplicationCase>('/applications', {
        method: 'POST',
        body: JSON.stringify(caseData),
      });
      set((state) => ({
        applicationCases: [...state.applicationCases, newCase],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteApplicationCase: async (id) => {
    set({ loading: true });
    try {
      await apiFetch(`/applications/${id}`, { method: 'DELETE' });
      set((state) => ({
        applicationCases: state.applicationCases.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
