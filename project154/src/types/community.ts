import type { Route } from './route';
import type { User } from './user';

export type UpdateType = 'detour' | 'construction' | 'accident' | 'other';
export type UpdateStatus = 'pending' | 'confirmed' | 'resolved';
export type CommentTargetType = 'share' | 'review' | 'update';

export interface Comment {
  id: string;
  targetId: string;
  targetType: CommentTargetType;
  userId: string;
  user: User;
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Share {
  id: string;
  routeId: string;
  route?: Route;
  userId: string;
  user: User;
  content: string;
  images: string[];
  shareLink: string;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  isFavorite?: boolean;
  createdAt: string;
}

export interface RouteUpdate {
  id: string;
  routeId: string;
  reporterId: string;
  reporter: User;
  type: UpdateType;
  description: string;
  location: string;
  status: UpdateStatus;
  createdAt: string;
  expiresAt: string;
}

export interface ShareFormData {
  routeId: string;
  content: string;
  images: string[];
}

export interface UpdateFormData {
  routeId: string;
  type: UpdateType;
  description: string;
  location: string;
}

export interface CommentFormData {
  targetId: string;
  targetType: CommentTargetType;
  content: string;
}

export interface CommunityFilters {
  type?: 'share' | 'update';
  routeId?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'likes';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CommunityPagination {
  items: (Share | RouteUpdate)[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const updateTypeLabels: Record<UpdateType, string> = {
  detour: '改道',
  construction: '施工',
  accident: '事故',
  other: '其他',
};

export const updateStatusLabels: Record<UpdateStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  resolved: '已解决',
};

export const updateTypeColors: Record<UpdateType, string> = {
  detour: 'bg-blue-500',
  construction: 'bg-yellow-500',
  accident: 'bg-red-500',
  other: 'bg-gray-500',
};

export const updateStatusColors: Record<UpdateStatus, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  resolved: 'bg-gray-500',
};
