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
    ratings: (userId: number) => [...queryKeys.users.all, 'ratings', userId] as const,
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
  problemTags: {
    all: ['problem-tags'] as const,
  },
  problems: {
    all: ['problems'] as const,
    list: (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      difficulty?: string;
      tags?: number[];
      status?: string;
    }) => [...queryKeys.problems.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.problems.all, 'detail', id] as const,
  },
  contests: {
    all: ['contests'] as const,
    list: (params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      type?: string;
      status?: string;
    }) => [...queryKeys.contests.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.contests.all, 'detail', id] as const,
    problems: (id: number) => [...queryKeys.contests.all, 'problems', id] as const,
    leaderboard: (id: number) => [...queryKeys.contests.all, 'leaderboard', id] as const,
    timeline: (id: number) => [...queryKeys.contests.all, 'timeline', id] as const,
  },
  submissions: {
    all: ['submissions'] as const,
    list: (params?: {
      page?: number;
      pageSize?: number;
      problemId?: number;
      contestId?: number;
      userId?: number;
      status?: string;
      language?: string;
    }) => [...queryKeys.submissions.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.submissions.all, 'detail', id] as const,
  },
  solutions: {
    all: ['solutions'] as const,
    list: (params?: {
      page?: number;
      pageSize?: number;
      problemId?: number;
    }) => [...queryKeys.solutions.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.solutions.all, 'detail', id] as const,
  },
  discussions: {
    all: ['discussions'] as const,
    list: (params?: {
      page?: number;
      pageSize?: number;
      problemId?: number;
      contestId?: number;
    }) => [...queryKeys.discussions.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.discussions.all, 'detail', id] as const,
  },
  ratings: {
    leaderboard: ['ratings', 'leaderboard'] as const,
  },
  moderation: {
    all: ['moderation'] as const,
    list: (params?: {
      page?: number;
      pageSize?: number;
      status?: string;
    }) => [...queryKeys.moderation.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.moderation.all, 'detail', id] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
