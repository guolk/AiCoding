import { create } from 'zustand'
import type { Publication, CopyrightContract, SalesRecord, MarketingCampaign, ReaderFeedback, FAQ, Reader, CreativeProject, Partner, Excerpt, MediaInterview, BookReview } from '@/types'
import { publications as mockPublications, copyrightContracts as mockContracts, salesRecords as mockSales, marketingCampaigns as mockCampaigns, readerFeedbacks as mockFeedbacks, faqs as mockFaqs, readers as mockReaders, creativeProjects as mockProjects, partners as mockPartners, excerpts as mockExcerpts, mediaInterviews as mockInterviews, bookReviews as mockReviews } from '@/data/mockData'

interface StoreState {
  publications: Publication[]
  copyrightContracts: CopyrightContract[]
  salesRecords: SalesRecord[]
  marketingCampaigns: MarketingCampaign[]
  readerFeedbacks: ReaderFeedback[]
  faqs: FAQ[]
  readers: Reader[]
  creativeProjects: CreativeProject[]
  partners: Partner[]
  excerpts: Excerpt[]
  mediaInterviews: MediaInterview[]
  bookReviews: BookReview[]

  addPublication: (pub: Publication) => void
  updatePublication: (id: string, data: Partial<Publication>) => void
  deletePublication: (id: string) => void

  addSalesRecord: (record: SalesRecord) => void

  addFeedback: (feedback: ReaderFeedback) => void
  updateFeedback: (id: string, data: Partial<ReaderFeedback>) => void
  deleteFeedback: (id: string) => void

  addFAQ: (faq: FAQ) => void
  updateFAQ: (id: string, data: Partial<FAQ>) => void
  deleteFAQ: (id: string) => void

  addReader: (reader: Reader) => void
  updateReader: (id: string, data: Partial<Reader>) => void

  addProject: (project: CreativeProject) => void
  updateProject: (id: string, data: Partial<CreativeProject>) => void
  deleteProject: (id: string) => void

  addPartner: (partner: Partner) => void
  updatePartner: (id: string, data: Partial<Partner>) => void

  addExcerpt: (excerpt: Excerpt) => void
  addInterview: (interview: MediaInterview) => void
  addBookReview: (review: BookReview) => void

  addCampaign: (campaign: MarketingCampaign) => void
}

export const useStore = create<StoreState>((set) => ({
  publications: mockPublications,
  copyrightContracts: mockContracts,
  salesRecords: mockSales,
  marketingCampaigns: mockCampaigns,
  readerFeedbacks: mockFeedbacks,
  faqs: mockFaqs,
  readers: mockReaders,
  creativeProjects: mockProjects,
  partners: mockPartners,
  excerpts: mockExcerpts,
  mediaInterviews: mockInterviews,
  bookReviews: mockReviews,

  addPublication: (pub) =>
    set((state) => ({ publications: [...state.publications, pub] })),

  updatePublication: (id, data) =>
    set((state) => ({
      publications: state.publications.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  deletePublication: (id) =>
    set((state) => ({
      publications: state.publications.filter((p) => p.id !== id),
    })),

  addSalesRecord: (record) =>
    set((state) => ({ salesRecords: [...state.salesRecords, record] })),

  addFeedback: (feedback) =>
    set((state) => ({ readerFeedbacks: [...state.readerFeedbacks, feedback] })),

  updateFeedback: (id, data) =>
    set((state) => ({
      readerFeedbacks: state.readerFeedbacks.map((f) =>
        f.id === id ? { ...f, ...data } : f
      ),
    })),

  deleteFeedback: (id) =>
    set((state) => ({
      readerFeedbacks: state.readerFeedbacks.filter((f) => f.id !== id),
    })),

  addFAQ: (faq) =>
    set((state) => ({ faqs: [...state.faqs, faq] })),

  updateFAQ: (id, data) =>
    set((state) => ({
      faqs: state.faqs.map((f) =>
        f.id === id ? { ...f, ...data } : f
      ),
    })),

  deleteFAQ: (id) =>
    set((state) => ({
      faqs: state.faqs.filter((f) => f.id !== id),
    })),

  addReader: (reader) =>
    set((state) => ({ readers: [...state.readers, reader] })),

  updateReader: (id, data) =>
    set((state) => ({
      readers: state.readers.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    })),

  addProject: (project) =>
    set((state) => ({ creativeProjects: [...state.creativeProjects, project] })),

  updateProject: (id, data) =>
    set((state) => ({
      creativeProjects: state.creativeProjects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      creativeProjects: state.creativeProjects.filter((p) => p.id !== id),
    })),

  addPartner: (partner) =>
    set((state) => ({ partners: [...state.partners, partner] })),

  updatePartner: (id, data) =>
    set((state) => ({
      partners: state.partners.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  addExcerpt: (excerpt) =>
    set((state) => ({ excerpts: [...state.excerpts, excerpt] })),

  addInterview: (interview) =>
    set((state) => ({ mediaInterviews: [...state.mediaInterviews, interview] })),

  addBookReview: (review) =>
    set((state) => ({ bookReviews: [...state.bookReviews, review] })),

  addCampaign: (campaign) =>
    set((state) => ({ marketingCampaigns: [...state.marketingCampaigns, campaign] })),
}))
