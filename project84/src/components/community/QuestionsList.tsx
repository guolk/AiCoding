import { useState } from 'react'
import { Search, Filter, TrendingUp, Clock, HelpCircle, Award, ChevronDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { QuestionCard } from '../community/QuestionCard'
import { TagCloud } from '../community/TagBadge'
import { categories } from '../../data/mockData'
import type { FilterOptions } from '../../types'

export function QuestionsList() {
  const { questions, allTags, followTag, unfollowTag, currentUser } = useApp()
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'newest',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredQuestions = questions
    .filter(q => {
      if (filters.category && q.category !== filters.category) return false
      if (filters.tag && !q.tags.includes(filters.tag)) return false
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return q.title.toLowerCase().includes(query) || q.content.toLowerCase().includes(query)
      }
      return true
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'popular':
          return b.viewCount - a.viewCount
        case 'unanswered':
          return a.answerCount - b.answerCount
        case 'most_voted':
          return b.voteCount - a.voteCount
        default:
          return 0
      }
    })

  const sortOptions = [
    { value: 'newest', label: '最新', icon: Clock },
    { value: 'popular', label: '最热', icon: TrendingUp },
    { value: 'unanswered', label: '待解决', icon: HelpCircle },
    { value: 'most_voted', label: '高票', icon: Award },
  ]

  const popularTags = [...allTags].sort((a, b) => b.followerCount - a.followerCount).slice(0, 12)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索问题..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }))}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-lg transition-colors ${
                  showFilters ? 'bg-primary-100 text-primary-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      !filters.category ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    全部
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat.name }))}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.category === cat.name ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">难度</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, difficulty: undefined }))}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      !filters.difficulty ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    全部
                  </button>
                  {['beginner', 'intermediate', 'advanced'].map(d => (
                    <button
                      key={d}
                      onClick={() => setFilters(prev => ({ ...prev, difficulty: d as any }))}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.difficulty === d ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d === 'beginner' ? '入门' : d === 'intermediate' ? '进阶' : '高级'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {filteredQuestions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">没有找到匹配的问题</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:w-72 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">热门标签</h3>
          <TagCloud
            tags={popularTags}
            followedIds={currentUser.followedTags}
            onFollow={followTag}
            onUnfollow={unfollowTag}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">统计信息</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">总问题数</span>
              <span className="text-sm font-semibold text-gray-900">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">已解决</span>
              <span className="text-sm font-semibold text-green-600">{questions.filter(q => q.hasAcceptedAnswer).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">待解决</span>
              <span className="text-sm font-semibold text-yellow-600">{questions.filter(q => !q.hasAcceptedAnswer).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
