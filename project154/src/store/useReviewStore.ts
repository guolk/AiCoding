import { create } from 'zustand';
import type { Review, ReviewFormData, ReviewFilters, ReviewPagination, RatingDistribution } from '@/types/review';
import { mockReviews, getReviewsByRouteId } from '@/mock/reviews';
import { generateId } from '@/utils/format';
import { useUserStore } from './useUserStore';

interface ReviewState {
  reviews: Review[];
  currentReview: Review | null;
  loading: boolean;
  total: number;
  fetchReviews: (filters?: Partial<ReviewFilters>) => Promise<ReviewPagination>;
  fetchReviewsByRouteId: (routeId: string) => Promise<Review[]>;
  submitReview: (data: ReviewFormData) => Promise<boolean>;
  likeReview: (reviewId: string) => void;
  getRouteStats: (routeId: string) => { avgSurfaceScore: number; avgSafetyScore: number; avgExperienceScore: number; avgOverallRating: number; totalReviews: number } | null;
  getRatingDistribution: (routeId: string) => RatingDistribution[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  currentReview: null,
  loading: false,
  total: 0,

  fetchReviews: async (filters = {}) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));

    let filteredReviews = [...mockReviews];

    if (filters.routeId) {
      filteredReviews = filteredReviews.filter(r => r.routeId === filters.routeId);
    }
    if (filters.userId) {
      filteredReviews = filteredReviews.filter(r => r.userId === filters.userId);
    }
    if (filters.minRating !== undefined) {
      filteredReviews = filteredReviews.filter(r => r.overallRating >= filters.minRating!);
    }
    if (filters.maxRating !== undefined) {
      filteredReviews = filteredReviews.filter(r => r.overallRating <= filters.maxRating!);
    }

    if (filters.sortBy) {
      filteredReviews.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'rating':
            comparison = a.overallRating - b.overallRating;
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'likes':
            comparison = a.likes - b.likes;
            break;
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    const total = filteredReviews.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedReviews = filteredReviews.slice(startIndex, startIndex + limit);

    set({
      reviews: paginatedReviews,
      total,
      loading: false,
    });

    return {
      reviews: paginatedReviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  fetchReviewsByRouteId: async (routeId: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));
    const reviews = getReviewsByRouteId(routeId);
    set({ reviews, loading: false });
    return reviews;
  },

  submitReview: async (data: ReviewFormData) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) {
      set({ loading: false });
      return false;
    }

    const avgSurface = (data.surfaceScore.pothole + data.surfaceScore.bikeLane + data.surfaceScore.traffic) / 3;
    const avgSafety = (data.safetyScore.intersection + data.safetyScore.lighting) / 2;
    const avgExperience = (data.experienceScore.scenery + data.experienceScore.challenge + data.experienceScore.enjoyment) / 3;
    const overallRating = Math.round(((avgSurface * 0.35 + avgSafety * 0.35 + avgExperience * 0.3) * 2)) / 2;

    const newReview: Review = {
      id: 'review-' + generateId(),
      routeId: data.routeId,
      userId: currentUser.id,
      user: currentUser,
      overallRating,
      surfaceScore: data.surfaceScore,
      safetyScore: data.safetyScore,
      experienceScore: data.experienceScore,
      segmentRatings: data.segmentRatings,
      comment: data.comment,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    mockReviews.unshift(newReview);
    set({ loading: false });
    return true;
  },

  likeReview: (reviewId: string) => {
    set(state => ({
      reviews: state.reviews.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            isLiked: !r.isLiked,
            likes: r.isLiked ? r.likes - 1 : r.likes + 1,
          };
        }
        return r;
      }),
    }));
  },

  getRouteStats: (routeId: string) => {
    const routeReviews = mockReviews.filter(r => r.routeId === routeId);
    if (routeReviews.length === 0) return null;

    const avgSurfaceScore = routeReviews.reduce((sum, r) => sum + (r.surfaceScore.pothole + r.surfaceScore.bikeLane + r.surfaceScore.traffic) / 3, 0) / routeReviews.length;
    const avgSafetyScore = routeReviews.reduce((sum, r) => sum + (r.safetyScore.intersection + r.safetyScore.lighting) / 2, 0) / routeReviews.length;
    const avgExperienceScore = routeReviews.reduce((sum, r) => sum + (r.experienceScore.scenery + r.experienceScore.challenge + r.experienceScore.enjoyment) / 3, 0) / routeReviews.length;
    const avgOverallRating = routeReviews.reduce((sum, r) => sum + r.overallRating, 0) / routeReviews.length;

    return {
      avgSurfaceScore: Math.round(avgSurfaceScore * 10) / 10,
      avgSafetyScore: Math.round(avgSafetyScore * 10) / 10,
      avgExperienceScore: Math.round(avgExperienceScore * 10) / 10,
      avgOverallRating: Math.round(avgOverallRating * 10) / 10,
      totalReviews: routeReviews.length,
    };
  },

  getRatingDistribution: (routeId: string) => {
    const routeReviews = mockReviews.filter(r => r.routeId === routeId);
    const total = routeReviews.length;
    const distribution: RatingDistribution[] = [];

    for (let i = 5; i >= 1; i--) {
      const count = routeReviews.filter(r => Math.floor(r.overallRating) === i).length;
      distribution.push({
        rating: i,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      });
    }

    return distribution;
  },
}));
