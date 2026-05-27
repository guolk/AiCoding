import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'

export default function Bottles() {
  const [bottles, setBottles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    loadBottles()
  }, [])

  async function loadBottles() {
    try {
      const data = await api.bottles.getAll()
      setBottles(data)
    } catch (error) {
      console.error('Failed to load bottles', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBottles = filter === 'ALL' 
    ? bottles 
    : bottles.filter(b => b.status === filter)

  function getBottleStatusLabel(status: string) {
    const labels: Record<string, { label: string; color: string }> = {
      IN_CELLAR: { label: '在窖', color: 'bg-green-100 text-green-800' },
      RESERVED: { label: '预留', color: 'bg-yellow-100 text-yellow-800' },
      OPENED: { label: '已开瓶', color: 'bg-blue-100 text-blue-800' },
      CONSUMED: { label: '已饮用', color: 'bg-gray-100 text-gray-800' }
    }
    return labels[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">酒款库存</h2>
          <p className="text-gray-500">共 {filteredBottles.length} 瓶</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'IN_CELLAR', 'RESERVED', 'OPENED', 'CONSUMED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-wine-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? '全部' : getBottleStatusLabel(status).label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {filteredBottles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">酒款</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">年份</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">购入价格</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">购入日期</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">存放位置</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredBottles.map((bottle) => (
                  <tr key={bottle.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link to={`/wines/${bottle.wineId}`} className="text-wine-600 hover:text-wine-700 font-medium">
                        {bottle.wine?.winery} {bottle.wine?.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{bottle.wine?.vintage}</td>
                    <td className="py-3 px-4 text-gray-600">¥{bottle.purchasePrice}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(bottle.purchaseDate).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{bottle.storageLocation || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBottleStatusLabel(bottle.status).color}`}>
                        {getBottleStatusLabel(bottle.status).label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {bottle.status === 'IN_CELLAR' && (
                        <Link
                          to={`/tasting/new?bottleId=${bottle.id}`}
                          className="text-wine-600 hover:text-wine-700 text-sm"
                        >
                          记录品饮
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无酒瓶</h3>
            <p className="text-gray-500 mb-6">在酒款详情中添加酒瓶入库</p>
            <Link to="/wines" className="px-6 py-3 bg-wine-600 text-white rounded-lg hover:bg-wine-700">
              浏览酒款
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
