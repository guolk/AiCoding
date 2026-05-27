import { useState } from 'react'
import { Search, Plus, Check } from 'lucide-react'
import { icons } from '../../data/mockData'
import { cn } from '../../utils/cn'

const categories = ['全部', '导航', '用户', '系统', '操作', '通知', '通讯', '反馈', '状态']

export default function IconLibrary() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredIcons = icons.filter((icon) => {
    const matchCategory = activeCategory === '全部' || icon.category === activeCategory
    const matchSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCategory && matchSearch
  })

  const copyIcon = (icon: typeof icons[0]) => {
    navigator.clipboard.writeText(icon.svg)
    setCopiedId(icon.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">图标库</h1>
          <p className="mt-1 text-gray-600">SVG图标的分类整理和搜索</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          上传图标
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索图标..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 6).map((cat) => (
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
          {filteredIcons.map((icon) => (
            <button
              key={icon.id}
              onClick={() => copyIcon(icon)}
              className="group relative p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
            >
              <div
                className="w-6 h-6 text-gray-700 group-hover:text-blue-600"
                dangerouslySetInnerHTML={{ __html: icon.svg }}
              />
              <span className="text-xs text-gray-500 truncate w-full text-center">
                {icon.name}
              </span>
              {copiedId === icon.id && (
                <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredIcons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">未找到匹配的图标</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-2">使用提示</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 点击图标可直接复制 SVG 代码</li>
          <li>• 图标统一使用 24x24px 尺寸，stroke-width: 2</li>
          <li>• 颜色使用 currentColor，可通过 CSS 控制</li>
        </ul>
      </div>
    </div>
  )
}