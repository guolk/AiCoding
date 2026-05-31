import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, ExternalLink, Star, Layers } from 'lucide-react'
import { MediaItem } from '@/types'
import { getMediaTypeLabel, getEditionLabel, getConditionLabel, getLendingStatusLabel, getConditionColor, formatPrice } from '@/utils/helpers'

interface MediaCardProps {
  media: MediaItem
  onDelete: (id: string) => void
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onDelete }) => {
  const navigate = useNavigate()

  return (
    <div
      className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#e94560]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#e94560]/10 hover:-translate-y-1"
      onClick={() => navigate(`/collections/${media.id}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {media.coverImage ? (
          <img
            src={media.coverImage}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#16213e] to-[#0f3460] flex items-center justify-center">
            <Layers size={48} className="text-white/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 px-3 py-1 bg-[#e94560]/90 rounded-full text-xs font-semibold backdrop-blur-sm">
          {getMediaTypeLabel(media.mediaType)}
        </div>

        {media.edition !== 'standard' && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-amber-500/90 rounded-full text-xs font-semibold backdrop-blur-sm">
            {getEditionLabel(media.edition)}
          </div>
        )}

        {media.lending.status !== 'available' && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 rounded-full text-xs font-semibold backdrop-blur-sm">
            {getLendingStatusLabel(media.lending.status)}
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/collections/${media.id}`)
            }}
            className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/collections/${media.id}/edit`)
            }}
            className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(media.id)
            }}
            className="p-2 bg-red-500/40 rounded-lg backdrop-blur-sm hover:bg-red-500/60 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 cursor-pointer">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
          {media.title}
        </h3>

        <p className="text-white/60 text-sm mb-2">
          {media.director || media.artist || ''}
        </p>

        <div className="flex items-center gap-2 mb-3">
          {media.releaseYear && (
            <span className="text-white/40 text-xs">
              {media.releaseYear}
            </span>
          )}
          {media.genre?.[0] && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white/40 text-xs">
                {media.genre[0]}
              </span>
            </>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs">
            <span className={`${getConditionColor(media.condition.overall)} font-medium`}>
              {getConditionLabel(media.condition.overall)}
            </span>
          </div>
          <div className="text-white/70 text-sm font-semibold">
            {formatPrice(media.value.currentEstimate)}
          </div>
        </div>

        {media.rating.personalScore > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Star size={12} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              {media.rating.personalScore.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaCard
