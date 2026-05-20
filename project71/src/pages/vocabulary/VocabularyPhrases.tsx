import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Star, StarOff, Layers, BookMarked } from 'lucide-react'
import { phrases } from '../../data/mockData'
import { Phrase } from '../../types'
import clsx from 'clsx'

const styleFilters = [
  { id: 'all', name: '全部' },
  { id: 'formal', name: '正式' },
  { id: 'informal', name: '非正式' },
  { id: 'written', name: '书面' },
  { id: 'spoken', name: '口语' }
]

export const VocabularyPhrases: React.FC = () => {
  const [phraseList, setPhraseList] = useState<Phrase[]>(phrases)
  const [activeStyle, setActiveStyle] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleFavorite = (id: string) => {
    setPhraseList(prev => prev.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ))
  }

  const filteredPhrases = phraseList.filter(phrase =>
    activeStyle === 'all' || phrase.style === activeStyle
  )

  const getStyleLabel = (style: string) => {
    switch (style) {
      case 'formal': return '正式'
      case 'informal': return '非正式'
      case 'written': return '书面'
      case 'spoken': return '口语'
      default: return style
    }
  }

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'formal': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'informal': return 'bg-green-100 text-green-700 border-green-200'
      case 'written': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'spoken': return 'bg-amber-100 text-amber-700 border-amber-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStyleGradient = (style: string) => {
    switch (style) {
      case 'formal': return 'from-blue-50 to-blue-100'
      case 'informal': return 'from-green-50 to-green-100'
      case 'written': return 'from-purple-50 to-purple-100'
      case 'spoken': return 'from-amber-50 to-amber-100'
      default: return 'from-gray-50 to-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vocabulary" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">表达归类</h1>
          <p className="text-gray-500">按风格分类整理常用表达</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {styleFilters.filter(s => s.id !== 'all').map(style => {
          const count = phraseList.filter(p => p.style === style.id).length
          return (
            <div
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={clsx(
                'p-4 rounded-xl cursor-pointer transition-all border-2',
                activeStyle === style.id
                  ? 'border-primary-500 bg-gradient-to-br ' + getStyleGradient(style.id)
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
              )}
            >
              <p className="text-3xl font-bold text-gray-800">{count}</p>
              <p className="text-sm text-gray-600">{style.name}表达</p>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {styleFilters.map(style => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={clsx(
                'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2',
                activeStyle === style.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {style.id !== 'all' && <Layers className="w-4 h-4" />}
              {style.name}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredPhrases.map(phrase => (
            <div
              key={phrase.id}
              className={clsx(
                'p-5 border-2 rounded-xl transition-all cursor-pointer',
                expandedId === phrase.id
                  ? 'border-primary-400 bg-gradient-to-br ' + getStyleGradient(phrase.style)
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              )}
              onClick={() => setExpandedId(expandedId === phrase.id ? null : phrase.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{phrase.phrase}</h3>
                    <span className={`badge border ${getStyleColor(phrase.style)}`}>
                      {getStyleLabel(phrase.style)}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 mb-2">{phrase.meaning}</p>
                  <p className="text-sm text-gray-500">
                    适用场景：{phrase.scenario}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(phrase.id)
                  }}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  {phrase.isFavorite ? (
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ) : (
                    <Star className="w-5 h-5 text-gray-300 hover:text-amber-500" />
                  )}
                </button>
              </div>

              {expandedId === phrase.id && (
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <div className="bg-white/80 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BookMarked className="w-4 h-4" />
                      使用说明
                    </h4>
                    <p className="text-sm text-gray-600">
                      这是一个{getStyleLabel(phrase.style)}表达，常用于{phrase.scenario}场景。
                      在实际使用时，请注意场合的正式程度选择合适的表达方式。
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
