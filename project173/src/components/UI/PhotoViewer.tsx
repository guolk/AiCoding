import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Photo } from '@/types'

export interface PhotoViewerProps {
  photos: Photo[]
  initialIndex?: number
  open: boolean
  onClose: () => void
}

export default function PhotoViewer({ photos, initialIndex = 0, open, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open, initialIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowLeft':
          goToPrev()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, currentIndex, photos.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  const handleDownload = async () => {
    const photo = photos[currentIndex]
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${photo.caption || 'photo'}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      window.open(photo.url, '_blank')
    }
  }

  if (!open || photos.length === 0) return null

  const currentPhoto = photos[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X size={24} />
      </button>

      <button
        onClick={handleDownload}
        className="absolute right-16 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        title="下载图片"
      >
        <Download size={24} />
      </button>

      <button
        onClick={() => setIsZoomed(!isZoomed)}
        className={cn(
          'absolute right-28 top-4 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/20',
          isZoomed ? 'bg-primary-500' : 'bg-white/10'
        )}
        title="放大图片"
      >
        <ZoomIn size={24} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="flex h-full w-full flex-col items-center justify-center p-8">
        <div
          className={cn(
            'relative flex-1 flex items-center justify-center w-full overflow-hidden',
            isZoomed && 'cursor-zoom-out'
          )}
          onClick={() => isZoomed && setIsZoomed(false)}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption}
            className={cn(
              'max-h-full max-w-full object-contain transition-transform duration-300',
              isZoomed && 'scale-150'
            )}
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-medium text-white">{currentPhoto.caption}</p>
          <p className="mt-1 text-sm text-white/60">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>

        {photos.length > 1 && (
          <div className="mt-4 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  index === currentIndex ? 'w-8 bg-white' : 'bg-white/40 hover:bg-white/60'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
