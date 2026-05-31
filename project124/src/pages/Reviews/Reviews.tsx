import React from 'react'
import { useMediaStore } from '@/stores/mediaStore'
import { Star, ThumbsUp, Users, Filter, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMediaTypeLabel, formatDate } from '@/utils/helpers'

const Reviews: React.FC = () => {
  const { media } = useMediaStore()

  const ratedItems = media.filter(m => m.rating.personalScore > 0)
  const recommendedItems = media.filter(m => m.rating.isRecommended)
  const itemsWithReviews = media.filter(m => m.rating.review && m.rating.review.length > 0)

  // Sort by rating (highest first)
  const sortedByRating = [...ratedItems].sort((a, b) => 
    b.rating.personalScore - a.rating.personalScore
  )

  // Get top rated
  const topRated = sortedByRating.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          推荐和评分
        </h1>
        <p className="text-white/60">
          记录您的观后感和推荐
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">已评分</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {ratedItems.length}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <ThumbsUp size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">已推荐</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {recommendedItems.length}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">有观后感</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {itemsWithReviews.length}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">平均评分</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {ratedItems.length > 0 
              ? (ratedItems.reduce((sum, m) => sum + m.rating.personalScore, 0) / ratedItems.length).toFixed(1)
              : '0.0'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <Star size={24} className="text-amber-400" />
            <h2 className="text-xl font-semibold text-white">
              评分最高
            </h2>
          </div>
          
          {topRated.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              暂无评分记录
            </div>
          ) : (
            <div className="space-y-3">
              {topRated.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/collections/${item.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <span className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div className="w-12 h-16 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-lg overflow-hidden flex-shrink-0">
                    {item.coverImage && (
                      <img 
                        src={item.coverImage} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-[#e94560] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-sm">
                      {getMediaTypeLabel(item.mediaType)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-amber-400" />
                      <span className="text-amber-400 font-semibold">
                        {item.rating.personalScore.toFixed(1)}
                      </span>
                    </div>
                    {item.rating.isRecommended && (
                      <span className="text-xs text-green-400">
                        已推荐
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recommended */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <ThumbsUp size={24} className="text-green-400" />
            <h2 className="text-xl font-semibold text-white">
              我的推荐
            </h2>
          </div>
          
          {recommendedItems.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              暂无推荐
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/collections/${item.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-12 h-16 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-lg overflow-hidden flex-shrink-0">
                    {item.coverImage && (
                      <img 
                        src={item.coverImage} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-[#e94560] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-sm">
                      {getMediaTypeLabel(item.mediaType)} · {item.rating.personalScore.toFixed(1)} ⭐
                    </p>
                    {item.rating.recommendedTo && item.rating.recommendedTo.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Users size={12} className="text-white/30" />
                        <p className="text-white/40 text-xs">
                          推荐给：{item.rating.recommendedTo.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Reviews */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">
          所有观后感
        </h2>
        
        {itemsWithReviews.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            暂无观后感记录
          </div>
        ) : (
          <div className="space-y-6">
            {itemsWithReviews.map((item) => (
              <Link
                key={item.id}
                to={`/collections/${item.id}`}
                className="block p-4 rounded-xl hover:bg-white/5 transition-colors group border border-white/5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-lg overflow-hidden flex-shrink-0">
                    {item.coverImage && (
                      <img 
                        src={item.coverImage} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg group-hover:text-[#e94560] transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400" />
                          <span className="text-amber-400 font-medium">
                            {item.rating.personalScore.toFixed(1)}
                          </span>
                        </div>
                        {item.rating.isRecommended && (
                          <ThumbsUp size={14} className="text-green-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-white/40 text-sm mb-3">
                      {getMediaTypeLabel(item.mediaType)} · {item.rating.lastUpdated ? formatDate(item.rating.lastUpdated) : ''}
                    </p>
                    <p className="text-white/70 leading-relaxed line-clamp-3">
                      {item.rating.review}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {ratedItems.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            评分分布
          </h2>
          <div className="space-y-3">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(score => {
              const count = ratedItems.filter(m => 
                m.rating.personalScore >= score && m.rating.personalScore < score + 1
              ).length
              const percentage = (count / ratedItems.length) * 100
              
              return (
                <div key={score} className="flex items-center gap-4">
                  <span className="w-8 text-right text-white/60 text-sm">
                    {score}.0
                  </span>
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-white/40 text-sm">
                    {count} 个
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews
