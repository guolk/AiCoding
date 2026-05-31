import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Grid, List, X } from 'lucide-react'
import { useMediaStore } from '@/stores/mediaStore'
import MediaCard from '@/components/MediaCard/MediaCard'
import { MediaItem, SortType, ViewMode } from '@/types'
import { getMediaTypeLabel, getEditionLabel, getLendingStatusLabel } from '@/utils/helpers'

const Collections: React.FC = () => {
  const {
    media,
    sortType,
    viewMode,
    searchQuery,
    filterType,
    filterEdition,
    filterLending,
    setSortType,
    setViewMode,
    setSearchQuery,
    setFilterType,
    setFilterEdition,
    setFilterLending,
    deleteMedia
  } = useMediaStore()

  const filteredAndSortedMedia = useMemo(() => {
    let result = [...media]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.director?.toLowerCase().includes(query) ||
          m.artist?.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (filterType) {
      result = result.filter((m) => m.mediaType === filterType)
    }

    // Filter by edition
    if (filterEdition) {
      result = result.filter((m) => m.edition === filterEdition)
    }

    // Filter by lending status
    if (filterLending) {
      result = result.filter((m) => m.lending.status === filterLending)
    }

    // Sort
    const sortFunctions: Record<SortType, (a: MediaItem, b: MediaItem) => number> = {
      title: (a, b) => a.title.localeCompare(b.title),
      director: (a, b) => (a.director || '').localeCompare(b.director || ''),
      year: (a, b) => (b.releaseYear || 0) - (a.releaseYear || 0),
      genre: (a, b) => (a.genre?.[0] || '').localeCompare(b.genre?.[0] || ''),
      price: (a, b) => b.value.currentEstimate - a.value.currentEstimate,
      rating: (a, b) => b.rating.personalScore - a.rating.personalScore
    }

    result.sort(sortFunctions[sortType])

    return result
  }, [media, searchQuery, filterType, filterEdition, filterLending, sortType])

  const mediaTypes = ['dvd', 'bluray', 'vinyl', 'cd', 'game']
  const editions = ['standard', 'limited', 'director_cut', 'collector', 'special']
  const lendingStatuses = ['available', 'lent', 'overdue']

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个收藏品吗？')) {
      deleteMedia(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            收藏档案
          </h1>
          <p className="text-white/60">
            {filteredAndSortedMedia.length} 件收藏品
          </p>
        </div>
        <Link
          to="/collections/add"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 transition-all duration-300 hover:scale-105"
        >
          <Plus size={20} />
          添加收藏
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="搜索标题、导演、艺术家..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50 focus:ring-2 focus:ring-[#e94560]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50 focus:ring-2 focus:ring-[#e94560]/20 transition-all appearance-none cursor-pointer"
          >
            <option value="title" className="bg-[#1a1a2e]">按标题排序</option>
            <option value="director" className="bg-[#1a1a2e]">按导演排序</option>
            <option value="year" className="bg-[#1a1a2e]">按年份排序</option>
            <option value="genre" className="bg-[#1a1a2e]">按类型排序</option>
            <option value="price" className="bg-[#1a1a2e]">按价格排序</option>
            <option value="rating" className="bg-[#1a1a2e]">按评分排序</option>
          </select>

          {/* View Mode */}
          <div className="flex bg-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${
                viewMode === 'grid' ? 'bg-[#e94560] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors ${
                viewMode === 'list' ? 'bg-[#e94560] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-white/40" />
          
          {/* Media Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType(null)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                !filterType 
                  ? 'bg-[#e94560] text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              全部
            </button>
            {mediaTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? null : type)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  filterType === type 
                    ? 'bg-[#e94560] text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {getMediaTypeLabel(type)}
              </button>
            ))}
          </div>

          {/* Edition Filter */}
          <div className="flex flex-wrap gap-2">
            {editions.map((edition) => (
              <button
                key={edition}
                onClick={() => setFilterEdition(filterEdition === edition ? null : edition)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  filterEdition === edition 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {getEditionLabel(edition)}
              </button>
            ))}
          </div>

          {/* Lending Status Filter */}
          <div className="flex flex-wrap gap-2">
            {lendingStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterLending(filterLending === status ? null : status)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  filterLending === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {getLendingStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {filteredAndSortedMedia.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredAndSortedMedia.map((item) => (
              <MediaCard key={item.id} media={item} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedMedia.map((item) => (
              <Link
                key={item.id}
                to={`/collections/${item.id}`}
                className="flex items-center gap-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#e94560]/30 transition-all duration-300 group"
              >
                <div className="w-20 h-28 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-xl overflow-hidden flex-shrink-0">
                  {item.coverImage && (
                    <img 
                      src={item.coverImage} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-[#e94560] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/60 mb-2">
                    {item.director || item.artist || ''}
                    {item.releaseYear && ` (${item.releaseYear})`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#e94560]/20 text-[#e94560] text-xs rounded-full">
                      {getMediaTypeLabel(item.mediaType)}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                      {getEditionLabel(item.edition)}
                    </span>
                    {item.rating.personalScore > 0 && (
                      <span className="text-amber-400 text-sm">
                        ⭐ {item.rating.personalScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-white">
                    ¥{item.value.currentEstimate.toFixed(0)}
                  </p>
                  <p className="text-white/40 text-sm">
                    {getLendingStatusLabel(item.lending.status)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
            <Filter size={48} className="text-white/20" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            没有找到收藏品
          </h3>
          <p className="text-white/50 mb-6">
            尝试调整筛选条件或添加新的收藏品
          </p>
          <Link
            to="/collections/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 transition-all duration-300"
          >
            <Plus size={20} />
            添加收藏
          </Link>
        </div>
      )}
    </div>
  )
}

export default Collections
