import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, Search, Volume2, Star, StarOff, Filter, BookOpen } from 'lucide-react'
import { vocabularyWords } from '../../data/mockData'
import { Word } from '../../types'
import clsx from 'clsx'

const categories = [
  { id: 'all', name: '全部' },
  { id: 'formal', name: '正式' },
  { id: 'informal', name: '非正式' },
  { id: 'written', name: '书面' },
  { id: 'spoken', name: '口语' }
]

export const VocabularyWords: React.FC = () => {
  const [words, setWords] = useState<Word[]>(vocabularyWords)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const toggleFavorite = (id: string) => {
    setWords(prev => prev.map(w =>
      w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
    ))
  }

  const speakWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.meaning.includes(searchTerm)
    const matchesCategory = activeCategory === 'all' || word.category === activeCategory
    const matchesFavorite = !showFavoritesOnly || word.isFavorite
    return matchesSearch && matchesCategory && matchesFavorite
  })

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'formal': return '正式'
      case 'informal': return '非正式'
      case 'written': return '书面'
      case 'spoken': return '口语'
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'formal': return 'bg-blue-100 text-blue-700'
      case 'informal': return 'bg-green-100 text-green-700'
      case 'written': return 'bg-purple-100 text-purple-700'
      case 'spoken': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vocabulary" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">词汇收藏</h1>
          <p className="text-gray-500">收藏和管理你的生词本</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索单词或释义..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={clsx(
              'px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2',
              showFavoritesOnly
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {showFavoritesOnly ? <Star className="w-5 h-5 fill-white" /> : <StarOff className="w-5 h-5" />}
            只看收藏
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                'px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2',
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat.id !== 'all' && <Filter className="w-4 h-4" />}
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredWords.map(word => (
            <div
              key={word.id}
              className="p-5 border-2 border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{word.word}</h3>
                    <button
                      onClick={() => speakWord(word.word)}
                      className="p-2 hover:bg-primary-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Volume2 className="w-5 h-5 text-primary-500" />
                    </button>
                    <span className={`badge ${getCategoryColor(word.category)}`}>
                      {getCategoryLabel(word.category)}
                    </span>
                  </div>
                  <p className="text-gray-500 mb-1">{word.phonetic}</p>
                  <p className="text-lg text-gray-700 mb-3">{word.meaning}</p>
                  <p className="text-sm text-gray-500 italic mb-4">
                    例句："{word.example}"
                  </p>
                  {word.collocations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-500">常用搭配：</span>
                      {word.collocations.map((coll, idx) => (
                        <span key={idx} className="badge bg-gray-100 text-gray-600">
                          {coll}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(word.id)}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  {word.isFavorite ? (
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  ) : (
                    <Star className="w-6 h-6 text-gray-300 hover:text-amber-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到匹配的单词</p>
            <p className="text-sm text-gray-400 mt-1">尝试调整搜索条件</p>
          </div>
        )}
      </div>
    </div>
  )
}
