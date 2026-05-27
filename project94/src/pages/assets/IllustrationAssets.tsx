import { useState } from 'react'
import { Search, Plus, ExternalLink, Copyright } from 'lucide-react'
import { illustrations } from '../../data/mockData'
import { cn } from '../../utils/cn'

const categories = ['全部', '空状态', '错误页', '反馈', '营销', '功能']

export default function IllustrationAssets() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIllustrations = illustrations.filter((ill) => {
    const matchCategory = activeCategory === '全部' || ill.category === activeCategory
    const matchSearch = ill.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">插画资源</h1>
          <p className="mt-1 text-gray-600">插画资源的版权和使用范围说明</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          上传插画
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索插画..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIllustrations.map((ill) => (
          <div
            key={ill.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="aspect-[4/3] bg-gray-100 relative">
              <img
                src={ill.url}
                alt={ill.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                  {ill.category}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 mb-2">{ill.name}</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Copyright className="w-3.5 h-3.5" />
                    版权信息
                  </p>
                  <p className="text-sm text-gray-700">{ill.copyright}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">使用范围</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ill.usageScope.map((scope, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <a
                  href={ill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  查看原图
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}