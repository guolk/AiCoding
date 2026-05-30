import { Paper, CitationRecord, CitationHistory, SocialMention, DownloadData, ApplicationCase } from '../../shared/types';
import { samplePapers, sampleCitationRecords, sampleCitationHistory, sampleSocialMentions, sampleDownloadData, sampleApplicationCases } from './sampleData';

class InMemoryStore {
  private papers: Map<string, Paper>;
  private citationRecords: Map<string, CitationRecord>;
  private citationHistory: Map<string, CitationHistory>;
  private socialMentions: Map<string, SocialMention>;
  private downloadData: Map<string, DownloadData>;
  private applicationCases: Map<string, ApplicationCase>;

  constructor() {
    this.papers = new Map();
    this.citationRecords = new Map();
    this.citationHistory = new Map();
    this.socialMentions = new Map();
    this.downloadData = new Map();
    this.applicationCases = new Map();
    this.initializeWithSampleData();
  }

  private initializeWithSampleData(): void {
    samplePapers.forEach(p => this.papers.set(p.id, p));
    sampleCitationRecords.forEach(c => this.citationRecords.set(c.id, c));
    sampleCitationHistory.forEach(h => this.citationHistory.set(h.id, h));
    sampleSocialMentions.forEach(s => this.socialMentions.set(s.id, s));
    sampleDownloadData.forEach(d => this.downloadData.set(d.id, d));
    sampleApplicationCases.forEach(a => this.applicationCases.set(a.id, a));
  }

  generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  getPapers(): Paper[] {
    return Array.from(this.papers.values());
  }

  getPaperById(id: string): Paper | undefined {
    return this.papers.get(id);
  }

  addPaper(paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'>): Paper {
    const now = new Date().toISOString();
    const newPaper: Paper = {
      ...paper,
      id: this.generateId('p'),
      createdAt: now,
      updatedAt: now
    };
    this.papers.set(newPaper.id, newPaper);
    return newPaper;
  }

  updatePaper(id: string, updates: Partial<Paper>): Paper | undefined {
    const paper = this.papers.get(id);
    if (!paper) return undefined;
    const updated: Paper = {
      ...paper,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.papers.set(id, updated);
    return updated;
  }

  deletePaper(id: string): boolean {
    const existed = this.papers.has(id);
    if (existed) {
      this.papers.delete(id);
      Array.from(this.citationRecords.values())
        .filter(c => c.paperId === id)
        .forEach(c => this.citationRecords.delete(c.id));
      Array.from(this.citationHistory.values())
        .filter(h => h.paperId === id)
        .forEach(h => this.citationHistory.delete(h.id));
      Array.from(this.socialMentions.values())
        .filter(s => s.paperId === id)
        .forEach(s => this.socialMentions.delete(s.id));
      Array.from(this.downloadData.values())
        .filter(d => d.paperId === id)
        .forEach(d => this.downloadData.delete(d.id));
      Array.from(this.applicationCases.values())
        .filter(a => a.paperId === id)
        .forEach(a => this.applicationCases.delete(a.id));
    }
    return existed;
  }

  getCitationRecordsByPaper(paperId: string): CitationRecord[] {
    return Array.from(this.citationRecords.values()).filter(c => c.paperId === paperId);
  }

  getAllCitationRecords(): CitationRecord[] {
    return Array.from(this.citationRecords.values());
  }

  updateCitationCategory(id: string, category: string): CitationRecord | undefined {
    const record = this.citationRecords.get(id);
    if (!record) return undefined;
    const categories: CitationRecord['category'][] = ['positive', 'critical', 'method', 'background', 'other'];
    if (!categories.includes(category as CitationRecord['category'])) {
      return undefined;
    }
    const updated = { ...record, category: category as CitationRecord['category'] };
    this.citationRecords.set(id, updated);
    return updated;
  }

  getCitationHistoryByPaper(paperId: string): CitationHistory[] {
    return Array.from(this.citationHistory.values())
      .filter(h => h.paperId === paperId)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
  }

  getAllCitationHistory(): CitationHistory[] {
    return Array.from(this.citationHistory.values());
  }

  syncCitationData(paperId: string): { paper: Paper; citationHistory: CitationHistory[] } | undefined {
    const paper = this.papers.get(paperId);
    if (!paper) return undefined;
    
    const variance = Math.floor(Math.random() * 30) + 5;
    const newCitations = paper.currentCitations + variance;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const existingHistory = Array.from(this.citationHistory.values()).find(
      h => h.paperId === paperId && h.year === currentYear && h.month === currentMonth
    );
    
    if (existingHistory) {
      existingHistory.citations += Math.floor(variance / 2);
    } else {
      const newHistory: CitationHistory = {
        id: this.generateId('ch'),
        paperId,
        year: currentYear,
        month: currentMonth,
        citations: Math.floor(variance / 2)
      };
      this.citationHistory.set(newHistory.id, newHistory);
    }
    
    const updatedPaper = this.updatePaper(paperId, { currentCitations: newCitations })!;
    return {
      paper: updatedPaper,
      citationHistory: this.getCitationHistoryByPaper(paperId)
    };
  }

  getSocialMentionsByPaper(paperId: string): SocialMention[] {
    return Array.from(this.socialMentions.values()).filter(s => s.paperId === paperId);
  }

  getAllSocialMentions(): SocialMention[] {
    return Array.from(this.socialMentions.values());
  }

  getDownloadDataByPaper(paperId: string): DownloadData[] {
    return Array.from(this.downloadData.values())
      .filter(d => d.paperId === paperId)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
  }

  getAllDownloadData(): DownloadData[] {
    return Array.from(this.downloadData.values());
  }

  getApplicationCases(): ApplicationCase[] {
    return Array.from(this.applicationCases.values());
  }

  addApplicationCase(caseData: Omit<ApplicationCase, 'id' | 'createdAt'>): ApplicationCase {
    const now = new Date().toISOString();
    const newCase: ApplicationCase = {
      ...caseData,
      id: this.generateId('ac'),
      createdAt: now
    };
    this.applicationCases.set(newCase.id, newCase);
    return newCase;
  }

  updateApplicationCase(id: string, updates: Partial<ApplicationCase>): ApplicationCase | undefined {
    const appCase = this.applicationCases.get(id);
    if (!appCase) return undefined;
    const updated: ApplicationCase = {
      ...appCase,
      ...updates
    };
    this.applicationCases.set(id, updated);
    return updated;
  }

  deleteApplicationCase(id: string): boolean {
    return this.applicationCases.delete(id);
  }
}

export const store = new InMemoryStore();
