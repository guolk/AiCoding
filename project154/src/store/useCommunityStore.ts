import { create } from 'zustand';
import type { Share, RouteUpdate, ShareFormData, UpdateFormData, CommentFormData, CommunityFilters, CommunityPagination, Comment } from '@/types/community';
import { mockShares, mockUpdates, getSharesByRouteId, getUpdatesByRouteId } from '@/mock/community';
import { generateId } from '@/utils/format';
import { useUserStore } from './useUserStore';

interface CommunityState {
  shares: Share[];
  updates: RouteUpdate[];
  currentShare: Share | null;
  loading: boolean;
  total: number;
  fetchCommunityFeed: (filters?: Partial<CommunityFilters>) => Promise<CommunityPagination>;
  fetchSharesByRouteId: (routeId: string) => Promise<Share[]>;
  fetchUpdatesByRouteId: (routeId: string) => Promise<RouteUpdate[]>;
  fetchShareById: (id: string) => Promise<Share | null>;
  createShare: (data: ShareFormData) => Promise<boolean>;
  createUpdate: (data: UpdateFormData) => Promise<boolean>;
  addComment: (data: CommentFormData) => Promise<boolean>;
  toggleLike: (type: 'share' | 'update' | 'comment', id: string) => void;
  toggleFavoriteShare: (shareId: string) => void;
  copyShareLink: (routeId: string) => string;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  shares: [],
  updates: [],
  currentShare: null,
  loading: false,
  total: 0,

  fetchCommunityFeed: async (filters = {}) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    let items: (Share | RouteUpdate)[] = [];

    if (filters.type === 'share' || !filters.type) {
      let shares = [...mockShares];
      if (filters.routeId) {
        shares = shares.filter(s => s.routeId === filters.routeId);
      }
      if (filters.userId) {
        shares = shares.filter(s => s.userId === filters.userId);
      }
      items = [...items, ...shares];
    }

    if (filters.type === 'update' || !filters.type) {
      let updates = [...mockUpdates];
      if (filters.routeId) {
        updates = updates.filter(u => u.routeId === filters.routeId);
      }
      items = [...items, ...updates];
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = items.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    const shares = paginatedItems.filter((item): item is Share => 'shareLink' in item);
    const updates = paginatedItems.filter((item): item is RouteUpdate => 'type' in item && !('shareLink' in item));

    set({
      shares,
      updates,
      total,
      loading: false,
    });

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  fetchSharesByRouteId: async (routeId: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));
    const shares = getSharesByRouteId(routeId);
    set({ shares, loading: false });
    return shares;
  },

  fetchUpdatesByRouteId: async (routeId: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));
    const updates = getUpdatesByRouteId(routeId);
    set({ updates, loading: false });
    return updates;
  },

  fetchShareById: async (id: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));
    const share = mockShares.find(s => s.id === id);
    if (share) {
      set({ currentShare: share, loading: false });
      return share;
    }
    set({ loading: false });
    return null;
  },

  createShare: async (data: ShareFormData) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
      set({ loading: false });
      return false;
    }

    const newShare: Share = {
      id: 'share-' + generateId(),
      routeId: data.routeId,
      userId: currentUser.id,
      user: currentUser,
      content: data.content,
      images: data.images,
      shareLink: `/community/share/${data.routeId}`,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    mockShares.unshift(newShare);
    set({ loading: false });
    return true;
  },

  createUpdate: async (data: UpdateFormData) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
      set({ loading: false });
      return false;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const newUpdate: RouteUpdate = {
      id: 'update-' + generateId(),
      routeId: data.routeId,
      reporterId: currentUser.id,
      reporter: currentUser,
      type: data.type,
      description: data.description,
      location: data.location,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    mockUpdates.unshift(newUpdate);
    set({ loading: false });
    return true;
  },

  addComment: async (data: CommentFormData) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
      set({ loading: false });
      return false;
    }

    const newComment: Comment = {
      id: 'comment-' + generateId(),
      targetId: data.targetId,
      targetType: data.targetType,
      userId: currentUser.id,
      user: currentUser,
      content: data.content,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    if (data.targetType === 'share') {
      const share = mockShares.find(s => s.id === data.targetId);
      if (share) {
        share.comments.push(newComment);
      }
    }

    set({ loading: false });
    return true;
  },

  toggleLike: (type: 'share' | 'update' | 'comment', id: string) => {
    if (type === 'share') {
      set(state => ({
        shares: state.shares.map(s => {
          if (s.id === id) {
            return {
              ...s,
              isLiked: !s.isLiked,
              likes: s.isLiked ? s.likes - 1 : s.likes + 1,
            };
          }
          return s;
        }),
        currentShare: state.currentShare?.id === id
          ? { ...state.currentShare, isLiked: !state.currentShare.isLiked, likes: state.currentShare.isLiked ? state.currentShare.likes - 1 : state.currentShare.likes + 1 }
          : state.currentShare,
      }));
    }
  },

  toggleFavoriteShare: (shareId: string) => {
    set(state => ({
      shares: state.shares.map(s => {
        if (s.id === shareId) {
          return { ...s, isFavorite: !s.isFavorite };
        }
        return s;
      }),
    }));
  },

  copyShareLink: (routeId: string) => {
    const link = `${window.location.origin}/community/share/${routeId}`;
    return link;
  },
}));
