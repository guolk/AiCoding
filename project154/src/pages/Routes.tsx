import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight, MapPin, Route as RouteIcon } from 'lucide-react';
import { useRouteStore } from '@/store/useRouteStore';
import { RouteCard } from '@/components/business/RouteCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import Empty from '@/components/Empty';
import {
  routeTypeLabels,
  difficultyLabels,
  surfaceTypeLabels,
  seasonLabels,
} from '@/types/route';
import type { RouteType, Difficulty, SurfaceType, Season, RouteFilters } from '@/types/route';

const sortOptions = [
  { value: 'rating', label: '评分最高', sortOrder: 'desc' as const },
  { value: 'distance', label: '距离最短', sortOrder: 'asc' as const },
  { value: 'difficulty', label: '难度适中', sortOrder: 'asc' as const },
  { value: 'createdAt', label: '最新发布', sortOrder: 'desc' as const },
];

const distanceRanges = [
  { label: '10公里以内', min: 0, max: 10 },
  { label: '10-30公里', min: 10, max: 30 },
  { label: '30-50公里', min: 30, max: 50 },
  { label: '50公里以上', min: 50, max: undefined },
];

export default function Routes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { routes, loading, total, filters, fetchRoutes, setFilters, resetFilters } = useRouteStore();
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '');
  const [showSidebar, setShowSidebar] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const currentSort = sortOptions.find(
    s => s.value === filters.sortBy && s.sortOrder === filters.sortOrder
  ) || sortOptions[0];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type?.length) count += filters.type.length;
    if (filters.difficulty?.length) count += filters.difficulty.length;
    if (filters.surfaceType?.length) count += filters.surfaceType.length;
    if (filters.season) count += 1;
    if (filters.minDistance !== undefined || filters.maxDistance !== undefined) count += 1;
    return count;
  }, [filters]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.type?.length) params.type = filters.type.join(',');
    if (filters.difficulty?.length) params.difficulty = filters.difficulty.join(',');
    if (filters.surfaceType?.length) params.surfaceType = filters.surfaceType.join(',');
    if (filters.season) params.season = filters.season;
    if (filters.minDistance !== undefined) params.minDistance = String(filters.minDistance);
    if (filters.maxDistance !== undefined) params.maxDistance = String(filters.maxDistance);
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.page) params.page = String(filters.page);
    if (filters.search) params.search = filters.search;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const difficultyParam = searchParams.get('difficulty');
    const surfaceTypeParam = searchParams.get('surfaceType');
    const seasonParam = searchParams.get('season') as Season | null;
    const minDistanceParam = searchParams.get('minDistance');
    const maxDistanceParam = searchParams.get('maxDistance');
    const sortByParam = searchParams.get('sortBy');
    const sortOrderParam = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');

    const newFilters = {
      ...(typeParam ? { type: typeParam.split(',') as RouteType[] } : {}),
      ...(difficultyParam ? { difficulty: difficultyParam.split(',') as Difficulty[] } : {}),
      ...(surfaceTypeParam ? { surfaceType: surfaceTypeParam.split(',') as SurfaceType[] } : {}),
      ...(seasonParam ? { season: seasonParam } : {}),
      ...(minDistanceParam ? { minDistance: Number(minDistanceParam) } : {}),
      ...(maxDistanceParam ? { maxDistance: Number(maxDistanceParam) } : {}),
      ...(sortByParam ? { sortBy: sortByParam as RouteFilters['sortBy'] } : {}),
      ...(sortOrderParam ? { sortOrder: sortOrderParam } : {}),
      ...(pageParam ? { page: Number(pageParam) } : {}),
      ...(searchParam ? { search: searchParam } : {}),
    };

    if (searchParam) {
      setSearchKeyword(searchParam);
    }

    loadRoutes(newFilters);
  }, [searchParams]);

  const loadRoutes = async (newFilters = {}) => {
    const result = await fetchRoutes(newFilters);
    setTotalPages(result.totalPages);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchKeyword || undefined, page: 1 });
    loadRoutes({ search: searchKeyword || undefined, page: 1 });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleSortChange = (sort: typeof sortOptions[0]) => {
    setFilters({ sortBy: sort.value as RouteFilters['sortBy'], sortOrder: sort.sortOrder, page: 1 });
    loadRoutes({ sortBy: sort.value as RouteFilters['sortBy'], sortOrder: sort.sortOrder, page: 1 });
  };

  const handleTypeToggle = (type: RouteType) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    setFilters({ type: newTypes.length ? newTypes : undefined, page: 1 });
    loadRoutes({ type: newTypes.length ? newTypes : undefined, page: 1 });
  };

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    const currentDifficulties = filters.difficulty || [];
    const newDifficulties = currentDifficulties.includes(difficulty)
      ? currentDifficulties.filter(d => d !== difficulty)
      : [...currentDifficulties, difficulty];
    setFilters({ difficulty: newDifficulties.length ? newDifficulties : undefined, page: 1 });
    loadRoutes({ difficulty: newDifficulties.length ? newDifficulties : undefined, page: 1 });
  };

  const handleSurfaceTypeToggle = (surfaceType: SurfaceType) => {
    const currentSurfaceTypes = filters.surfaceType || [];
    const newSurfaceTypes = currentSurfaceTypes.includes(surfaceType)
      ? currentSurfaceTypes.filter(s => s !== surfaceType)
      : [...currentSurfaceTypes, surfaceType];
    setFilters({ surfaceType: newSurfaceTypes.length ? newSurfaceTypes : undefined, page: 1 });
    loadRoutes({ surfaceType: newSurfaceTypes.length ? newSurfaceTypes : undefined, page: 1 });
  };

  const handleSeasonToggle = (season: Season) => {
    const newSeason = filters.season === season ? undefined : season;
    setFilters({ season: newSeason, page: 1 });
    loadRoutes({ season: newSeason, page: 1 });
  };

  const handleDistanceRangeSelect = (range: typeof distanceRanges[0]) => {
    const isSelected = filters.minDistance === range.min && filters.maxDistance === range.max;
    setFilters({
      minDistance: isSelected ? undefined : range.min,
      maxDistance: isSelected ? undefined : range.max,
      page: 1,
    });
    loadRoutes({
      minDistance: isSelected ? undefined : range.min,
      maxDistance: isSelected ? undefined : range.max,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    resetFilters();
    setSearchKeyword('');
    loadRoutes();
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
    loadRoutes({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isTypeActive = (type: RouteType) => filters.type?.includes(type);
  const isDifficultyActive = (difficulty: Difficulty) => filters.difficulty?.includes(difficulty);
  const isSurfaceTypeActive = (surfaceType: SurfaceType) => filters.surfaceType?.includes(surfaceType);
  const isSeasonActive = (season: Season) => filters.season === season;
  const isDistanceRangeActive = (range: typeof distanceRanges[0]) =>
    filters.minDistance === range.min && filters.maxDistance === range.max;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">骑行路线</h1>
          <p className="text-gray-600">发现适合你的骑行路线，探索城市与自然之美</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                search
                placeholder="搜索路线名称、起点、终点..."
                value={searchKeyword}
                onChange={handleSearchChange}
                className="text-lg"
              />
            </div>
            <Button type="submit" size="lg">
              <Search className="w-5 h-5" />
              搜索
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowSidebar(!showSidebar)}
              className="relative"
            >
              <Filter className="w-5 h-5" />
              筛选
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </form>
        </motion.div>

        <div className="flex gap-6">
          <AnimatePresence>
            {showSidebar && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-72 flex-shrink-0"
              >
                <Card className="sticky top-8">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                        <h2 className="text-lg font-bold text-gray-900">筛选条件</h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSidebar(false)}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">路线类型</h3>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(routeTypeLabels) as RouteType[]).map(type => (
                            <Badge
                              key={type}
                              variant={isTypeActive(type) ? 'primary' : 'default'}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleTypeToggle(type)}
                            >
                              {routeTypeLabels[type]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">难度级别</h3>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(difficultyLabels) as Difficulty[]).map(difficulty => (
                            <Badge
                              key={difficulty}
                              variant={isDifficultyActive(difficulty) ? 'primary' : 'default'}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleDifficultyToggle(difficulty)}
                            >
                              {difficultyLabels[difficulty]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">路面类型</h3>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(surfaceTypeLabels) as SurfaceType[]).map(surfaceType => (
                            <Badge
                              key={surfaceType}
                              variant={isSurfaceTypeActive(surfaceType) ? 'primary' : 'default'}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleSurfaceTypeToggle(surfaceType)}
                            >
                              {surfaceTypeLabels[surfaceType]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">季节适骑性</h3>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(seasonLabels) as Season[]).map(season => (
                            <Badge
                              key={season}
                              variant={isSeasonActive(season) ? 'primary' : 'default'}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleSeasonToggle(season)}
                            >
                              {seasonLabels[season]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">距离范围</h3>
                        <div className="space-y-2">
                          {distanceRanges.map((range, index) => (
                            <div
                              key={index}
                              onClick={() => handleDistanceRangeSelect(range)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                isDistanceRangeActive(range)
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <RouteIcon className={`w-4 h-4 ${
                                  isDistanceRangeActive(range) ? 'text-teal-600' : 'text-gray-400'
                                }`} />
                                <span className={`text-sm ${
                                  isDistanceRangeActive(range) ? 'text-teal-700 font-medium' : 'text-gray-700'
                                }`}>
                                  {range.label}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {activeFilterCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-gray-100"
                      >
                        <Button variant="ghost" fullWidth onClick={handleResetFilters}>
                          重置筛选条件
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.aside>
            )}
          </AnimatePresence>

          <main className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-between gap-4 mb-6"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span>
                  共找到 <span className="font-bold text-gray-900">{total}</span> 条路线
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">排序：</span>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {sortOptions.map((sort) => (
                    <Button
                      key={sort.value}
                      variant={currentSort.value === sort.value && currentSort.sortOrder === sort.sortOrder ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handleSortChange(sort)}
                      className="text-sm"
                    >
                      {sort.label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md h-96 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : routes.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {routes.map((route, index) => (
                      <RouteCard key={route.id} route={route} index={index} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center justify-center gap-2 mt-10"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                      disabled={filters.page === 1}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const currentPage = filters.page || 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'primary' : 'ghost'}
                              size="icon"
                              onClick={() => handlePageChange(page)}
                              className="w-10 h-10"
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={filters.page === totalPages}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="text-center py-16">
                  <CardContent>
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <RouteIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      没有找到符合条件的路线
                    </h3>
                    <p className="text-gray-500 mb-6">
                      尝试调整筛选条件或搜索关键词，发现更多精彩路线
                    </p>
                    <Button onClick={handleResetFilters}>
                      重置筛选条件
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
