import { create } from 'zustand';
import type { Route, RouteFilters, RoutePagination } from '@/types/route';
import { mockRoutes } from '@/mock/routes';
import { isFavorite, toggleFavorite as toggleFav } from '@/utils/storage';

interface RouteState {
  routes: Route[];
  currentRoute: Route | null;
  filters: RouteFilters;
  loading: boolean;
  total: number;
  fetchRoutes: (filters?: Partial<RouteFilters>) => Promise<RoutePagination>;
  fetchRouteDetail: (id: string) => Promise<Route | null>;
  setFilters: (filters: Partial<RouteFilters>) => void;
  resetFilters: () => void;
  toggleFavorite: (routeId: string) => boolean;
  getFavoriteRoutes: () => Route[];
  searchRoutes: (keyword: string) => Route[];
}

const defaultFilters: RouteFilters = {
  sortBy: 'rating',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
};

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  currentRoute: null,
  filters: defaultFilters,
  loading: false,
  total: 0,

  fetchRoutes: async (filters = {}) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentFilters = { ...get().filters, ...filters };
    set({ filters: currentFilters });

    let filteredRoutes = [...mockRoutes];

    if (currentFilters.type && currentFilters.type.length > 0) {
      filteredRoutes = filteredRoutes.filter(r => currentFilters.type!.includes(r.type));
    }
    if (currentFilters.difficulty && currentFilters.difficulty.length > 0) {
      filteredRoutes = filteredRoutes.filter(r => currentFilters.difficulty!.includes(r.difficulty));
    }
    if (currentFilters.surfaceType && currentFilters.surfaceType.length > 0) {
      filteredRoutes = filteredRoutes.filter(r => currentFilters.surfaceType!.includes(r.surfaceType));
    }
    if (currentFilters.season) {
      filteredRoutes = filteredRoutes.filter(r =>
        r.seasonRatings.some(s => s.season === currentFilters.season && s.rating >= 4)
      );
    }
    if (currentFilters.minDistance !== undefined) {
      filteredRoutes = filteredRoutes.filter(r => r.distance >= currentFilters.minDistance!);
    }
    if (currentFilters.maxDistance !== undefined) {
      filteredRoutes = filteredRoutes.filter(r => r.distance <= currentFilters.maxDistance!);
    }
    if (currentFilters.minElevation !== undefined) {
      filteredRoutes = filteredRoutes.filter(r => r.elevation >= currentFilters.minElevation!);
    }
    if (currentFilters.maxElevation !== undefined) {
      filteredRoutes = filteredRoutes.filter(r => r.elevation <= currentFilters.maxElevation!);
    }
    if (currentFilters.search) {
      const keyword = currentFilters.search.toLowerCase();
      filteredRoutes = filteredRoutes.filter(r =>
        r.name.toLowerCase().includes(keyword) ||
        r.startPoint.toLowerCase().includes(keyword) ||
        r.endPoint.toLowerCase().includes(keyword) ||
        r.description.toLowerCase().includes(keyword)
      );
    }

    if (currentFilters.sortBy) {
      filteredRoutes.sort((a, b) => {
        let comparison = 0;
        switch (currentFilters.sortBy) {
          case 'rating':
            comparison = a.stats.avgOverallRating - b.stats.avgOverallRating;
            break;
          case 'distance':
            comparison = a.distance - b.distance;
            break;
          case 'difficulty':
            const diffOrder = { easy: 0, medium: 1, hard: 2, extreme: 3 };
            comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty];
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return currentFilters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    const total = filteredRoutes.length;
    const page = currentFilters.page || 1;
    const limit = currentFilters.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginatedRoutes = filteredRoutes.slice(startIndex, startIndex + limit);

    const routesWithFavorites = paginatedRoutes.map(route => ({
      ...route,
      isFavorite: isFavorite(route.id),
    }));

    set({
      routes: routesWithFavorites,
      total,
      loading: false,
    });

    return {
      routes: routesWithFavorites,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  fetchRouteDetail: async (id: string) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 200));

    const route = mockRoutes.find(r => r.id === id);
    if (route) {
      const routeWithFavorite = {
        ...route,
        isFavorite: isFavorite(route.id),
      };
      set({ currentRoute: routeWithFavorite, loading: false });
      return routeWithFavorite;
    }
    set({ loading: false });
    return null;
  },

  setFilters: (filters: Partial<RouteFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  toggleFavorite: (routeId: string) => {
    const isFav = toggleFav(routeId);
    set(state => ({
      routes: state.routes.map(r =>
        r.id === routeId ? { ...r, isFavorite: isFav } : r
      ),
      currentRoute: state.currentRoute?.id === routeId
        ? { ...state.currentRoute, isFavorite: isFav }
        : state.currentRoute,
    }));
    return isFav;
  },

  getFavoriteRoutes: () => {
    return mockRoutes
      .filter(r => isFavorite(r.id))
      .map(r => ({ ...r, isFavorite: true }));
  },

  searchRoutes: (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();
    return mockRoutes.filter(r =>
      r.name.toLowerCase().includes(lowerKeyword) ||
      r.startPoint.toLowerCase().includes(lowerKeyword) ||
      r.endPoint.toLowerCase().includes(lowerKeyword)
    ).slice(0, 5);
  },
}));
