import React from 'react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { X, Calendar, MapPin, CloudSun, Tag, Lock, Star } from 'lucide-react'
import { DiaryEntry } from '../types'
import { cn } from '../utils'
import { stickers } from '../data/stickers'

interface DiaryViewerProps {
  diary: DiaryEntry
  onClose: () => void
}

const DiaryViewer: React.FC<DiaryViewerProps> = ({ diary, onClose }) => {
  const paperBgClass = {
    grid: 'paper-grid',
    lines: 'paper-lines',
    dots: 'paper-dots',
    blank: 'paper-blank',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col card-shadow">
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary-50 to-pink-50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{diary.title}</h2>
            {diary.isImportant && <Star size={18} className="text-yellow-500 fill-yellow-500" />}
            {diary.isPrivate && <Lock size={18} className="text-red-500" />}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className={cn('p-8', paperBgClass[diary.paperBackground])}>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {format(parseISO(diary.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
                </div>
                {diary.weather && (
                  <div className="flex items-center gap-1">
                    <CloudSun size={16} />
                    {diary.weather.icon} {diary.weather.condition}
                  </div>
                )}
                {diary.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {diary.location.address}
                  </div>
                )}
              </div>

              {diary.mood && (
                <div className="mb-6 flex items-center gap-2">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: diary.mood.color + '30' }}
                  >
                    {diary.mood.emoji}
                  </span>
                  <span className="text-gray-600">{diary.mood.name}</span>
                </div>
              )}

              <div
                className="diary-content prose prose-sm max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: diary.content }}
              />

              {diary.photos.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">照片</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {diary.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.dataUrl}
                        alt="photo"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {diary.drawings.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">手绘</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {diary.drawings.map((drawing) => (
                      <img
                        key={drawing.id}
                        src={drawing.dataUrl}
                        alt="drawing"
                        className="w-full aspect-video object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {diary.voiceNotes.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">语音备忘</h4>
                  <div className="space-y-2">
                    {diary.voiceNotes.map((note) => (
                      <audio
                        key={note.id}
                        controls
                        src={note.dataUrl}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              )}

              {diary.stickers.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">贴纸</h4>
                  <div className="flex flex-wrap gap-4">
                    {diary.stickers.map((s) => {
                      const sticker = stickers.find((st) => st.id === s.stickerId)
                      return sticker ? (
                        <span key={s.id} className="text-4xl">{sticker.emoji}</span>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {diary.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {diary.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1"
                    >
                      <Tag size={14} />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiaryViewer
