import { create } from 'zustand';
import type { User } from '@/types/user';
import { currentUser, mockUsers } from '@/mock/users';

interface UserState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: currentUser,
  users: mockUsers,
  isAuthenticated: true,
  loading: false,

  login: async (email: string, password: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      set({ currentUser: user, isAuthenticated: true, loading: false });
      return true;
    }
    set({ loading: false });
    return false;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  updateProfile: async (data: Partial<User>) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    const { currentUser } = get();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      set({ currentUser: updatedUser, loading: false });
      return true;
    }
    set({ loading: false });
    return false;
  },

  getUserById: (id: string) => {
    return get().users.find(u => u.id === id);
  },
}));
