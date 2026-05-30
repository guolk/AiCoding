import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Conference,
  Submission,
  Review,
  Paper,
  PaperVersion,
  Collaborator,
  ChecklistItem,
  AttendancePlan,
  TravelItem,
  Presentation,
  Expense,
  Scholar,
  CollaborationIntent,
  ConferenceNote,
  Publication,
} from '../types';
import { generateId } from '../utils/storage';

interface AppState {
  conferences: Conference[];
  submissions: Submission[];
  reviews: Review[];
  papers: Paper[];
  paperVersions: PaperVersion[];
  collaborators: Collaborator[];
  checklistItems: ChecklistItem[];
  attendancePlans: AttendancePlan[];
  travelItems: TravelItem[];
  presentations: Presentation[];
  expenses: Expense[];
  scholars: Scholar[];
  collaborationIntents: CollaborationIntent[];
  conferenceNotes: ConferenceNote[];
  publications: Publication[];
  addConference: (conference: Omit<Conference, 'id' | 'createdAt'>) => void;
  updateConference: (id: string, conference: Partial<Conference>) => void;
  deleteConference: (id: string) => void;
  addSubmission: (submission: Omit<Submission, 'id' | 'createdAt'>) => void;
  updateSubmission: (id: string, submission: Partial<Submission>) => void;
  deleteSubmission: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  updateReview: (id: string, review: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  addPaper: (paper: Omit<Paper, 'id' | 'createdAt'>) => void;
  updatePaper: (id: string, paper: Partial<Paper>) => void;
  deletePaper: (id: string) => void;
  addPaperVersion: (version: Omit<PaperVersion, 'id' | 'createdAt'>) => void;
  updatePaperVersion: (id: string, version: Partial<PaperVersion>) => void;
  deletePaperVersion: (id: string) => void;
  addCollaborator: (collaborator: Omit<Collaborator, 'id' | 'createdAt'>) => void;
  updateCollaborator: (id: string, collaborator: Partial<Collaborator>) => void;
  deleteCollaborator: (id: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => void;
  updateChecklistItem: (id: string, item: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  addAttendancePlan: (plan: Omit<AttendancePlan, 'id' | 'createdAt'>) => void;
  updateAttendancePlan: (id: string, plan: Partial<AttendancePlan>) => void;
  deleteAttendancePlan: (id: string) => void;
  addTravelItem: (item: Omit<TravelItem, 'id' | 'createdAt'>) => void;
  updateTravelItem: (id: string, item: Partial<TravelItem>) => void;
  deleteTravelItem: (id: string) => void;
  addPresentation: (presentation: Omit<Presentation, 'id' | 'createdAt'>) => void;
  updatePresentation: (id: string, presentation: Partial<Presentation>) => void;
  deletePresentation: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addScholar: (scholar: Omit<Scholar, 'id' | 'createdAt'>) => void;
  updateScholar: (id: string, scholar: Partial<Scholar>) => void;
  deleteScholar: (id: string) => void;
  addCollaborationIntent: (intent: Omit<CollaborationIntent, 'id' | 'createdAt'>) => void;
  updateCollaborationIntent: (id: string, intent: Partial<CollaborationIntent>) => void;
  deleteCollaborationIntent: (id: string) => void;
  addConferenceNote: (note: Omit<ConferenceNote, 'id' | 'createdAt'>) => void;
  updateConferenceNote: (id: string, note: Partial<ConferenceNote>) => void;
  deleteConferenceNote: (id: string) => void;
  addPublication: (publication: Omit<Publication, 'id' | 'createdAt'>) => void;
  updatePublication: (id: string, publication: Partial<Publication>) => void;
  deletePublication: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      conferences: [],
      submissions: [],
      reviews: [],
      papers: [],
      paperVersions: [],
      collaborators: [],
      checklistItems: [],
      attendancePlans: [],
      travelItems: [],
      presentations: [],
      expenses: [],
      scholars: [],
      collaborationIntents: [],
      conferenceNotes: [],
      publications: [],

      addConference: (conference) =>
        set((state) => ({
          conferences: [
            ...state.conferences,
            { ...conference, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateConference: (id, conference) =>
        set((state) => ({
          conferences: state.conferences.map((c) =>
            c.id === id ? { ...c, ...conference } : c
          ),
        })),
      deleteConference: (id) =>
        set((state) => ({
          conferences: state.conferences.filter((c) => c.id !== id),
          submissions: state.submissions.filter((s) => s.conferenceId !== id),
          attendancePlans: state.attendancePlans.filter((a) => a.conferenceId !== id),
          conferenceNotes: state.conferenceNotes.filter((n) => n.conferenceId !== id),
        })),

      addSubmission: (submission) =>
        set((state) => ({
          submissions: [
            ...state.submissions,
            { ...submission, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateSubmission: (id, submission) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...submission } : s
          ),
        })),
      deleteSubmission: (id) =>
        set((state) => ({
          submissions: state.submissions.filter((s) => s.id !== id),
          reviews: state.reviews.filter((r) => r.submissionId !== id),
          attendancePlans: state.attendancePlans.filter((a) => a.submissionId !== id),
        })),

      addReview: (review) =>
        set((state) => ({
          reviews: [
            ...state.reviews,
            { ...review, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateReview: (id, review) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, ...review } : r
          ),
        })),
      deleteReview: (id) =>
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== id),
        })),

      addPaper: (paper) =>
        set((state) => ({
          papers: [
            ...state.papers,
            { ...paper, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updatePaper: (id, paper) =>
        set((state) => ({
          papers: state.papers.map((p) =>
            p.id === id ? { ...p, ...paper } : p
          ),
        })),
      deletePaper: (id) =>
        set((state) => ({
          papers: state.papers.filter((p) => p.id !== id),
          paperVersions: state.paperVersions.filter((v) => v.paperId !== id),
          collaborators: state.collaborators.filter((c) => c.paperId !== id),
          checklistItems: state.checklistItems.filter((c) => c.paperId !== id),
          submissions: state.submissions.filter((s) => s.paperId !== id),
        })),

      addPaperVersion: (version) =>
        set((state) => ({
          paperVersions: [
            ...state.paperVersions,
            { ...version, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updatePaperVersion: (id, version) =>
        set((state) => ({
          paperVersions: state.paperVersions.map((v) =>
            v.id === id ? { ...v, ...version } : v
          ),
        })),
      deletePaperVersion: (id) =>
        set((state) => ({
          paperVersions: state.paperVersions.filter((v) => v.id !== id),
        })),

      addCollaborator: (collaborator) =>
        set((state) => ({
          collaborators: [
            ...state.collaborators,
            { ...collaborator, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateCollaborator: (id, collaborator) =>
        set((state) => ({
          collaborators: state.collaborators.map((c) =>
            c.id === id ? { ...c, ...collaborator } : c
          ),
        })),
      deleteCollaborator: (id) =>
        set((state) => ({
          collaborators: state.collaborators.filter((c) => c.id !== id),
        })),

      addChecklistItem: (item) =>
        set((state) => ({
          checklistItems: [
            ...state.checklistItems,
            { ...item, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateChecklistItem: (id, item) =>
        set((state) => ({
          checklistItems: state.checklistItems.map((c) =>
            c.id === id ? { ...c, ...item } : c
          ),
        })),
      deleteChecklistItem: (id) =>
        set((state) => ({
          checklistItems: state.checklistItems.filter((c) => c.id !== id),
        })),

      addAttendancePlan: (plan) =>
        set((state) => ({
          attendancePlans: [
            ...state.attendancePlans,
            { ...plan, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateAttendancePlan: (id, plan) =>
        set((state) => ({
          attendancePlans: state.attendancePlans.map((a) =>
            a.id === id ? { ...a, ...plan } : a
          ),
        })),
      deleteAttendancePlan: (id) =>
        set((state) => ({
          attendancePlans: state.attendancePlans.filter((a) => a.id !== id),
          travelItems: state.travelItems.filter((t) => t.attendancePlanId !== id),
          presentations: state.presentations.filter((p) => p.attendancePlanId !== id),
          expenses: state.expenses.filter((e) => e.attendancePlanId !== id),
        })),

      addTravelItem: (item) =>
        set((state) => ({
          travelItems: [
            ...state.travelItems,
            { ...item, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateTravelItem: (id, item) =>
        set((state) => ({
          travelItems: state.travelItems.map((t) =>
            t.id === id ? { ...t, ...item } : t
          ),
        })),
      deleteTravelItem: (id) =>
        set((state) => ({
          travelItems: state.travelItems.filter((t) => t.id !== id),
        })),

      addPresentation: (presentation) =>
        set((state) => ({
          presentations: [
            ...state.presentations,
            { ...presentation, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updatePresentation: (id, presentation) =>
        set((state) => ({
          presentations: state.presentations.map((p) =>
            p.id === id ? { ...p, ...presentation } : p
          ),
        })),
      deletePresentation: (id) =>
        set((state) => ({
          presentations: state.presentations.filter((p) => p.id !== id),
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            { ...expense, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateExpense: (id, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expense } : e
          ),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addScholar: (scholar) =>
        set((state) => ({
          scholars: [
            ...state.scholars,
            { ...scholar, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateScholar: (id, scholar) =>
        set((state) => ({
          scholars: state.scholars.map((s) =>
            s.id === id ? { ...s, ...scholar } : s
          ),
        })),
      deleteScholar: (id) =>
        set((state) => ({
          scholars: state.scholars.filter((s) => s.id !== id),
          collaborationIntents: state.collaborationIntents.filter((c) => c.scholarId !== id),
        })),

      addCollaborationIntent: (intent) =>
        set((state) => ({
          collaborationIntents: [
            ...state.collaborationIntents,
            { ...intent, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateCollaborationIntent: (id, intent) =>
        set((state) => ({
          collaborationIntents: state.collaborationIntents.map((c) =>
            c.id === id ? { ...c, ...intent } : c
          ),
        })),
      deleteCollaborationIntent: (id) =>
        set((state) => ({
          collaborationIntents: state.collaborationIntents.filter((c) => c.id !== id),
        })),

      addConferenceNote: (note) =>
        set((state) => ({
          conferenceNotes: [
            ...state.conferenceNotes,
            { ...note, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateConferenceNote: (id, note) =>
        set((state) => ({
          conferenceNotes: state.conferenceNotes.map((n) =>
            n.id === id ? { ...n, ...note } : n
          ),
        })),
      deleteConferenceNote: (id) =>
        set((state) => ({
          conferenceNotes: state.conferenceNotes.filter((n) => n.id !== id),
        })),

      addPublication: (publication) =>
        set((state) => ({
          publications: [
            ...state.publications,
            { ...publication, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updatePublication: (id, publication) =>
        set((state) => ({
          publications: state.publications.map((p) =>
            p.id === id ? { ...p, ...publication } : p
          ),
        })),
      deletePublication: (id) =>
        set((state) => ({
          publications: state.publications.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'academic-conference-manager-storage',
    }
  )
);
