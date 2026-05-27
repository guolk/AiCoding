import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Box, ArrowRight } from 'lucide-react'
import { components } from '../../data/mockData'
import { cn } from '../../utils/cn'

const categories = ['全部', '通用', '表单', '数据展示', '反馈', '导航']

export default function ComponentList() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredComponents = components.filter((comp) => {
    const matchCategory = activeCategory === '全部' || comp.category === activeCategory
    const matchSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">组件文档</h1>
          <p className="mt-1 text-gray-600">完整的组件文档和使用指南</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          新增组件
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索组件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                activeCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((comp) => (
          <Link
            key={comp.id}
            to={`/components/${comp.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Box className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{comp.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{comp.description}</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {comp.category}
              </span>
              {comp.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}