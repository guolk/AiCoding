import React, { useState } from 'react'
import { X } from 'lucide-react'
import { stickers, stickerCategories } from '../data/stickers'
import { cn } from '../utils'

interface StickerPanelProps {
  onSelectSticker: (stickerId: string) => void
  onClose: () => void
}

const StickerPanel: React.FC<StickerPanelProps> = ({ onSelectSticker, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(stickerCategories[0])

  const filteredStickers = stickers.filter((s) => s.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl overflow-hidden card-shadow w-96">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h3 className="font-medium">贴纸库</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {stickerCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm transition-colors',
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {filteredStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onSelectSticker(sticker.id)}
                className="w-12 h-12 flex items-center justify-center text-2xl rounded-lg hover:bg-gray-100 transition-colors"
                title={sticker.name}
              >
                {sticker.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-500">
          点击贴纸添加到日记
        </div>
      </div>
    </div>
  )
}

export default StickerPanel
