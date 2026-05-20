import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Users, Filter, ChevronRight, Star, Clock } from 'lucide-react'
import { dialogueScenarios } from '../../data/mockData'
import clsx from 'clsx'

const categories = [
  { id: 'all', name: '全部场景', icon: '🎯' },
  { id: 'restaurant', name: '餐厅点餐', icon: '🍽️' },
  { id: 'direction', name: '问路', icon: '🗺️' },
  { id: 'shopping', name: '购物', icon: '🛍️' },
  { id: 'hospital', name: '就医', icon: '🏥' },
  { id: 'meeting', name: '工作会议', icon: '💼' }
]

const difficultyLabels = {
  easy: { text: '简单', color: 'bg-green-100 text-green-700' },
  medium: { text: '中等', color: 'bg-amber-100 text-amber-700' },
  hard: { text: '困难', color: 'bg-red-100 text-red-700' }
}

export const DialogueHome: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const filteredScenarios = dialogueScenarios.filter(scenario => {
    const categoryMatch = activeCategory === 'all' || scenario.category === activeCategory
    const difficultyMatch = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty
    return categoryMatch && difficultyMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">情景对话</h1>
          <p className="text-gray-500 mt-1">选择场景，扮演角色，练习真实对话</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">对话场景</p>
            <p className="text-2xl font-bold text-gray-800">{dialogueScenarios.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">可扮演角色</p>
            <p className="text-2xl font-bold text-gray-800">10+</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Star className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">平均评分</p>
            <p className="text-2xl font-bold text-gray-800">4.8</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-700">筛选场景</h3>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                'px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2',
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-gray-500 py-2">难度：</span>
          {['all', 'easy', 'medium', 'hard'].map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                selectedDifficulty === diff
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {diff === 'all' ? '全部' : diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map(scenario => (
          <Link
            key={scenario.id}
            to={`/dialogue/${scenario.id}`}
            className="card card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{scenario.icon}</div>
              <span className={clsx(
                'badge',
                difficultyLabels[scenario.difficulty].color
              )}>
                {difficultyLabels[scenario.difficulty].text}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{scenario.title}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{scenario.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">可扮演角色：</span>
              <div className="flex gap-1">
                {scenario.roles.map((role, idx) => (
                  <span key={idx} className="badge badge-primary text-xs">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Clock className="w-4 h-4" />
              <span>{scenario.lines.length} 句对话</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex -space-x-2">
                {scenario.roles.slice(0, 3).map((role, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  >
                    {role[0]}
                  </div>
                ))}
              </div>
              <span className="text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                开始练习 <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">没有找到匹配的场景</h3>
          <p className="text-gray-500">请尝试调整筛选条件</p>
        </div>
      )}
    </div>
  )
}
