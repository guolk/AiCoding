import { useState } from 'react'
import { Search, Plus, Edit2, Trash2 } from 'lucide-react'
import { designTokens } from '../../data/mockData'
import { cn } from '../../utils/cn'

const categories = [
  { id: 'all', label: '全部', color: '' },
  { id: 'color', label: '颜色', color: 'bg-red-100 text-red-700' },
  { id: 'typography', label: '字体', color: 'bg-blue-100 text-blue-700' },
  { id: 'spacing', label: '间距', color: 'bg-green-100 text-green-700' },
  { id: 'radius', label: '圆角', color: 'bg-amber-100 text-amber-700' },
  { id: 'shadow', label: '阴影', color: 'bg-purple-100 text-purple-700' },
]

export default function DesignTokens() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTokens = designTokens.filter((token) => {
    const matchCategory = activeCategory === 'all' || token.category === activeCategory
    const matchSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.semanticName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const renderTokenPreview = (token: typeof designTokens[0]) => {
    if (token.category === 'color') {
      return (
        <div
          className="w-10 h-10 rounded-lg border border-gray-200"
          style={{ backgroundColor: token.value }}
        />
      )
    }
    if (token.category === 'spacing') {
      return (
        <div className="flex items-center gap-1">
          <div
            className="bg-blue-500 rounded"
            style={{ width: token.value, height: '16px' }}
          />
          <span className="text-xs text-gray-500">{token.value}</span>
        </div>
      )
    }
    if (token.category === 'radius') {
      return (
        <div
          className="w-10 h-10 bg-blue-500"
          style={{ borderRadius: token.value }}
        />
      )
    }
    if (token.category === 'shadow') {
      return (
        <div
          className="w-10 h-10 bg-white rounded-lg border border-gray-200"
          style={{ boxShadow: token.value }}
        />
      )
    }
    return (
      <div className="text-sm font-medium text-gray-700">{token.value}</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">设计Token</h1>
          <p className="mt-1 text-gray-600">统一管理设计系统的基础变量</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          新建Token
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索Token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                activeCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTokens.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">预览</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">名称</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">语义化名称</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">值</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">描述</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">分类</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    {renderTokenPreview(token)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-900">{token.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                      {token.semanticName}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-700 font-mono text-sm">{token.value}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-600 text-sm">{token.description}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      'px-2.5 py-1 text-xs rounded-full',
                      categories.find(c => c.id === token.category)?.color || 'bg-gray-100 text-gray-600'
                    )}>
                      {categories.find(c => c.id === token.category)?.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? '未找到匹配的Token' : '暂无数据'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? `没有找到与 "${searchQuery}" 相关的结果` : '还没有创建任何Token'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}