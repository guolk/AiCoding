import { QueryClient } from '@tanstack/react-query';
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
  exercises: {
    all: ['exercises'] as const,
    list: (params?: {
      difficulty?: string;
      search?: string;
    }) => [...queryKeys.exercises.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.exercises.all, 'detail', id] as const,
  },
  videoCourses: {
    all: ['videoCourses'] as const,
    list: (params?: {
      difficulty?: string;
      search?: string;
    }) => [...queryKeys.videoCourses.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.videoCourses.all, 'detail', id] as const,
  },
  practiceSessions: {
    all: ['practiceSessions'] as const,
    list: (params?: {
      userId?: number;
      exerciseId?: string;
    }) => [...queryKeys.practiceSessions.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.practiceSessions.all, 'detail', id] as const,
  },
  community: {
    all: ['community'] as const,
    posts: ['community', 'posts'] as const,
    checkIns: ['community', 'checkIns'] as const,
    leaderboard: ['community', 'leaderboard'] as const,
  },
  learningPath: {
    all: ['learningPath'] as const,
    detail: (userId?: number) => [...queryKeys.learningPath.all, 'detail', userId] as const,
  },
  purchases: {
    all: ['purchases'] as const,
    list: (params?: {
      userId?: number;
      type?: string;
    }) => [...queryKeys.purchases.all, 'list', params] as const,
  },
  teacher: {
    all: ['teacher'] as const,
    students: ['teacher', 'students'] as const,
    revenue: ['teacher', 'revenue'] as const,
    courses: ['teacher', 'courses'] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
