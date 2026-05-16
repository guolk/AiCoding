import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { MoodTag } from '../types'
import { cn } from '../utils'

interface MoodSelectorProps {
  selectedMood: MoodTag | null
  onSelect: (mood: MoodTag | null) => void
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelect }) => {
  const { getAllMoods, addCustomMood, settings } = useStore()
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customMoodName, setCustomMoodName] = useState('')
  const [customMoodEmoji, setCustomMoodEmoji] = useState('😊')
  const [customMoodColor, setCustomMoodColor] = useState('#4ade80')

  const moods = getAllMoods()

  const handleAddCustomMood = () => {
    if (customMoodName.trim()) {
      addCustomMood({
        name: customMoodName.trim(),
        emoji: customMoodEmoji,
        color: customMoodColor,
      })
      setCustomMoodName('')
      setShowCustomForm(false)
    }
  }

  const emojis = ['😊', '😢', '😠', '😌', '🤩', '😰', '🙏', '😴', '🥰', '😎', '🤔', '💪']
  const colors = ['#4ade80', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#fb923c', '#34d399']

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">心情：</span>
        <div className="flex flex-wrap gap-1">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => onSelect(selectedMood?.id === mood.id ? null : mood)}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all text-lg',
                selectedMood?.id === mood.id
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  : 'hover:scale-105'
              )}
              style={{ backgroundColor: mood.color + '30' }}
              title={mood.name}
            >
              {mood.emoji}
            </button>
          ))}
          <button
            onClick={() => setShowCustomForm(true)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <Plus size={16} />
          </button>
        </div>
        {selectedMood && (
          <span className="text-sm text-gray-600 ml-2">{selectedMood.name}</span>
        )}
      </div>

      {showCustomForm && (
        <div className="absolute top-full left-0 mt-2 bg-white p-4 rounded-xl shadow-lg border z-10 w-72">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">添加自定义心情</h4>
            <button
              onClick={() => setShowCustomForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">名称</label>
              <input
                type="text"
                value={customMoodName}
                onChange={(e) => setCustomMoodName(e.target.value)}
                placeholder="例如：期待"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">表情</label>
              <div className="flex flex-wrap gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setCustomMoodEmoji(emoji)}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-lg',
                      customMoodEmoji === emoji ? 'bg-primary-100 ring-2 ring-primary-400' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">颜色</label>
              <div className="flex flex-wrap gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCustomMoodColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full',
                      customMoodColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleAddCustomMood}
              className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
            >
              添加
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MoodSelector
