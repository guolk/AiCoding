import { QueryClient, QueryFunction } from '@tanstack/react-query';
import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  auth: ['auth'] as const,
  users: {
    all: ['users'] as const,
    list: (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      roleId?: number;
    }) => [...queryKeys.users.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.users.all, 'detail', id] as const,
  },
  roles: {
    all: ['roles'] as const,
    detail: (id: number) => [...queryKeys.roles.all, 'detail', id] as const,
  },
  permissions: {
    all: ['permissions'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activities: ['dashboard', 'activities'] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
  community: {
    all: ['community'] as const,
    posts: ['community', 'posts'] as const,
    challenges: ['community', 'challenges'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    plans: ['subscription', 'plans'] as const,
    current: ['subscription', 'current'] as const,
  },
  matching: {
    all: ['matching'] as const,
    recommendations: ['matching', 'recommendations'] as const,
    pending: ['matching', 'pending'] as const,
    accepted: ['matching', 'accepted'] as const,
  },
  chat: {
    all: ['chat'] as const,
    rooms: ['chat', 'rooms'] as const,
    messages: (roomId: string) => ['chat', 'messages', roomId] as const,
  },
  vocabulary: {
    all: ['vocabulary'] as const,
    items: ['vocabulary', 'items'] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
