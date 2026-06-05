import { create } from 'zustand';
import { Behavior, BehaviorType, StudentGroup, GroupMember } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId, formatDate } from '../utils/helpers';
import { mockBehaviors, mockGroups, mockGroupMembers } from '../data/mockData';

interface ClassroomState {
  behaviors: Behavior[];
  groups: StudentGroup[];
  groupMembers: GroupMember[];
  loading: boolean;
  initialized: boolean;
  initData: () => Promise<void>;
  addBehavior: (studentId: string, type: BehaviorType, description: string, points: number) => void;
  deleteBehavior: (id: string) => void;
  getBehaviorsByStudent: (studentId: string) => Behavior[];
  getBehaviorsByDate: (date: string) => Behavior[];
  getStudentBehaviorPoints: (studentId: string) => number;
  addGroup: (group: Omit<StudentGroup, 'id'>) => void;
  updateGroup: (id: string, updates: Partial<StudentGroup>) => void;
  deleteGroup: (id: string) => void;
  addGroupMember: (groupId: string, studentId: string, role: string) => void;
  removeGroupMember: (id: string) => void;
  updateGroupMemberRole: (id: string, role: string) => void;
  getGroupMembers: (groupId: string) => GroupMember[];
  getStudentGroups: (studentId: string) => StudentGroup[];
  saveToStorage: () => Promise<void>;
}

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  behaviors: [],
  groups: [],
  groupMembers: [],
  loading: false,
  initialized: false,

  initData: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    const storedBehaviors = await storage.get<Behavior[]>(STORAGE_KEYS.BEHAVIORS);
    const storedGroups = await storage.get<StudentGroup[]>(STORAGE_KEYS.GROUPS);
    const storedMembers = await storage.get<GroupMember[]>(STORAGE_KEYS.GROUP_MEMBERS);
    
    const behaviors = storedBehaviors && storedBehaviors.length > 0 ? storedBehaviors : mockBehaviors;
    const groups = storedGroups && storedGroups.length > 0 ? storedGroups : mockGroups;
    const groupMembers = storedMembers && storedMembers.length > 0 ? storedMembers : mockGroupMembers;
    
    if (!storedBehaviors || storedBehaviors.length === 0) {
      await storage.set(STORAGE_KEYS.BEHAVIORS, behaviors);
    }
    if (!storedGroups || storedGroups.length === 0) {
      await storage.set(STORAGE_KEYS.GROUPS, groups);
    }
    if (!storedMembers || storedMembers.length === 0) {
      await storage.set(STORAGE_KEYS.GROUP_MEMBERS, groupMembers);
    }
    
    set({ behaviors, groups, groupMembers, initialized: true, loading: false });
  },

  addBehavior: (studentId, type, description, points) => {
    const { behaviors } = get();
    const newBehavior: Behavior = {
      id: generateId(),
      studentId,
      date: formatDate(new Date()),
      type,
      description,
      points
    };
    const newBehaviors = [newBehavior, ...behaviors];
    set({ behaviors: newBehaviors });
    get().saveToStorage();
  },

  deleteBehavior: (id) => {
    const { behaviors } = get();
    const newBehaviors = behaviors.filter(b => b.id !== id);
    set({ behaviors: newBehaviors });
    get().saveToStorage();
  },

  getBehaviorsByStudent: (studentId) => {
    return get().behaviors
      .filter(b => b.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getBehaviorsByDate: (date) => {
    return get().behaviors.filter(b => b.date === date);
  },

  getStudentBehaviorPoints: (studentId) => {
    const studentBehaviors = get().getBehaviorsByStudent(studentId);
    return studentBehaviors.reduce((sum, b) => sum + b.points, 0);
  },

  addGroup: (groupData) => {
    const { groups } = get();
    const newGroup: StudentGroup = {
      ...groupData,
      id: generateId()
    };
    const newGroups = [...groups, newGroup];
    set({ groups: newGroups });
    get().saveToStorage();
  },

  updateGroup: (id, updates) => {
    const { groups } = get();
    const newGroups = groups.map(g => g.id === id ? { ...g, ...updates } : g);
    set({ groups: newGroups });
    get().saveToStorage();
  },

  deleteGroup: (id) => {
    const { groups, groupMembers } = get();
    const newGroups = groups.filter(g => g.id !== id);
    const newMembers = groupMembers.filter(m => m.groupId !== id);
    set({ groups: newGroups, groupMembers: newMembers });
    get().saveToStorage();
  },

  addGroupMember: (groupId, studentId, role) => {
    const { groupMembers } = get();
    const existing = groupMembers.find(m => m.groupId === groupId && m.studentId === studentId);
    if (existing) return;
    
    const newMember: GroupMember = {
      id: generateId(),
      groupId,
      studentId,
      role
    };
    const newMembers = [...groupMembers, newMember];
    set({ groupMembers: newMembers });
    get().saveToStorage();
  },

  removeGroupMember: (id) => {
    const { groupMembers } = get();
    const newMembers = groupMembers.filter(m => m.id !== id);
    set({ groupMembers: newMembers });
    get().saveToStorage();
  },

  updateGroupMemberRole: (id, role) => {
    const { groupMembers } = get();
    const newMembers = groupMembers.map(m => m.id === id ? { ...m, role } : m);
    set({ groupMembers: newMembers });
    get().saveToStorage();
  },

  getGroupMembers: (groupId) => {
    return get().groupMembers.filter(m => m.groupId === groupId);
  },

  getStudentGroups: (studentId) => {
    const { groups, groupMembers } = get();
    const studentMemberIds = groupMembers
      .filter(m => m.studentId === studentId)
      .map(m => m.groupId);
    return groups.filter(g => studentMemberIds.includes(g.id));
  },

  saveToStorage: async () => {
    const { behaviors, groups, groupMembers } = get();
    await storage.set(STORAGE_KEYS.BEHAVIORS, behaviors);
    await storage.set(STORAGE_KEYS.GROUPS, groups);
    await storage.set(STORAGE_KEYS.GROUP_MEMBERS, groupMembers);
  }
}));
