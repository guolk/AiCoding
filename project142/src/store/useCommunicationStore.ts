import { create } from 'zustand';
import { Communication, CommunicationType, Announcement, LeaveRequest, LeaveStatus, HomeVisit } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId, formatDate } from '../utils/helpers';
import { mockCommunications, mockAnnouncements, mockLeaves, mockHomeVisits } from '../data/mockData';

interface CommunicationState {
  communications: Communication[];
  announcements: Announcement[];
  leaves: LeaveRequest[];
  homeVisits: HomeVisit[];
  loading: boolean;
  initialized: boolean;
  initData: () => Promise<void>;
  addCommunication: (studentId: string, type: CommunicationType, reason: string, content: string, operator: string) => void;
  deleteCommunication: (id: string) => void;
  getCommunicationsByStudent: (studentId: string) => Communication[];
  addAnnouncement: (title: string, content: string, author: string) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  addLeave: (studentId: string, startDate: string, endDate: string, reason: string, attachmentUrl?: string) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus) => void;
  deleteLeave: (id: string) => void;
  getLeavesByStudent: (studentId: string) => LeaveRequest[];
  addHomeVisit: (studentId: string, date: string, purpose: string, content: string, participants: string) => void;
  updateHomeVisit: (id: string, updates: Partial<HomeVisit>) => void;
  deleteHomeVisit: (id: string) => void;
  getHomeVisitsByStudent: (studentId: string) => HomeVisit[];
  saveToStorage: () => Promise<void>;
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  communications: [],
  announcements: [],
  leaves: [],
  homeVisits: [],
  loading: false,
  initialized: false,

  initData: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    const storedComm = await storage.get<Communication[]>(STORAGE_KEYS.COMMUNICATIONS);
    const storedAnn = await storage.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS);
    const storedLeaves = await storage.get<LeaveRequest[]>(STORAGE_KEYS.LEAVES);
    const storedVisits = await storage.get<HomeVisit[]>(STORAGE_KEYS.HOME_VISITS);
    
    const communications = storedComm && storedComm.length > 0 ? storedComm : mockCommunications;
    const announcements = storedAnn && storedAnn.length > 0 ? storedAnn : mockAnnouncements;
    const leaves = storedLeaves && storedLeaves.length > 0 ? storedLeaves : mockLeaves;
    const homeVisits = storedVisits && storedVisits.length > 0 ? storedVisits : mockHomeVisits;
    
    if (!storedComm || storedComm.length === 0) {
      await storage.set(STORAGE_KEYS.COMMUNICATIONS, communications);
    }
    if (!storedAnn || storedAnn.length === 0) {
      await storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    }
    if (!storedLeaves || storedLeaves.length === 0) {
      await storage.set(STORAGE_KEYS.LEAVES, leaves);
    }
    if (!storedVisits || storedVisits.length === 0) {
      await storage.set(STORAGE_KEYS.HOME_VISITS, homeVisits);
    }
    
    set({ communications, announcements, leaves, homeVisits, initialized: true, loading: false });
  },

  addCommunication: (studentId, type, reason, content, operator) => {
    const { communications } = get();
    const newComm: Communication = {
      id: generateId(),
      studentId,
      date: formatDate(new Date()),
      type,
      reason,
      content,
      operator
    };
    const newList = [newComm, ...communications];
    set({ communications: newList });
    get().saveToStorage();
  },

  deleteCommunication: (id) => {
    const { communications } = get();
    const newList = communications.filter(c => c.id !== id);
    set({ communications: newList });
    get().saveToStorage();
  },

  getCommunicationsByStudent: (studentId) => {
    return get().communications
      .filter(c => c.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  addAnnouncement: (title, content, author) => {
    const { announcements } = get();
    const newAnn: Announcement = {
      id: generateId(),
      title,
      content,
      date: formatDate(new Date()),
      author
    };
    const newList = [newAnn, ...announcements];
    set({ announcements: newList });
    get().saveToStorage();
  },

  updateAnnouncement: (id, updates) => {
    const { announcements } = get();
    const newList = announcements.map(a => a.id === id ? { ...a, ...updates } : a);
    set({ announcements: newList });
    get().saveToStorage();
  },

  deleteAnnouncement: (id) => {
    const { announcements } = get();
    const newList = announcements.filter(a => a.id !== id);
    set({ announcements: newList });
    get().saveToStorage();
  },

  addLeave: (studentId, startDate, endDate, reason, attachmentUrl = '') => {
    const { leaves } = get();
    const newLeave: LeaveRequest = {
      id: generateId(),
      studentId,
      startDate,
      endDate,
      reason,
      status: 'pending',
      attachmentUrl
    };
    const newList = [newLeave, ...leaves];
    set({ leaves: newList });
    get().saveToStorage();
  },

  updateLeaveStatus: (id, status) => {
    const { leaves } = get();
    const newList = leaves.map(l => l.id === id ? { ...l, status } : l);
    set({ leaves: newList });
    get().saveToStorage();
  },

  deleteLeave: (id) => {
    const { leaves } = get();
    const newList = leaves.filter(l => l.id !== id);
    set({ leaves: newList });
    get().saveToStorage();
  },

  getLeavesByStudent: (studentId) => {
    return get().leaves
      .filter(l => l.studentId === studentId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  addHomeVisit: (studentId, date, purpose, content, participants) => {
    const { homeVisits } = get();
    const newVisit: HomeVisit = {
      id: generateId(),
      studentId,
      date,
      purpose,
      content,
      participants
    };
    const newList = [newVisit, ...homeVisits];
    set({ homeVisits: newList });
    get().saveToStorage();
  },

  updateHomeVisit: (id, updates) => {
    const { homeVisits } = get();
    const newList = homeVisits.map(v => v.id === id ? { ...v, ...updates } : v);
    set({ homeVisits: newList });
    get().saveToStorage();
  },

  deleteHomeVisit: (id) => {
    const { homeVisits } = get();
    const newList = homeVisits.filter(v => v.id !== id);
    set({ homeVisits: newList });
    get().saveToStorage();
  },

  getHomeVisitsByStudent: (studentId) => {
    return get().homeVisits
      .filter(v => v.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  saveToStorage: async () => {
    const { communications, announcements, leaves, homeVisits } = get();
    await storage.set(STORAGE_KEYS.COMMUNICATIONS, communications);
    await storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    await storage.set(STORAGE_KEYS.LEAVES, leaves);
    await storage.set(STORAGE_KEYS.HOME_VISITS, homeVisits);
  }
}));
