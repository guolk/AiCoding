import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member, MemberFormData } from '@/types/member';
import { generateMockMembers, createNewMember } from '@/utils/mock';
import { getToday } from '@/utils/date';

interface MemberState {
  members: Member[];
  initialized: boolean;
  initMockData: () => void;
  addMember: (data: MemberFormData) => Member;
  updateMember: (id: string, data: Partial<MemberFormData>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;
  searchMembers: (keyword: string) => Member[];
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      members: [],
      initialized: false,
      
      initMockData: () => {
        if (get().initialized) return;
        const mockMembers = generateMockMembers();
        set({ members: mockMembers, initialized: true });
      },
      
      addMember: (data: MemberFormData) => {
        const newMember = createNewMember(data);
        set((state) => ({
          members: [...state.members, newMember],
        }));
        return newMember;
      },
      
      updateMember: (id: string, data: Partial<MemberFormData>) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data, updatedAt: getToday() } : m
          ),
        }));
      },
      
      deleteMember: (id: string) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
      },
      
      getMemberById: (id: string) => {
        return get().members.find((m) => m.id === id);
      },
      
      searchMembers: (keyword: string) => {
        if (!keyword) return get().members;
        const lowerKeyword = keyword.toLowerCase();
        return get().members.filter(
          (m) =>
            m.name.toLowerCase().includes(lowerKeyword) ||
            m.phone.includes(keyword)
        );
      },
    }),
    {
      name: 'member-store',
    }
  )
);
