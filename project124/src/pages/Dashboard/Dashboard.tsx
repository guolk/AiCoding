import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMediaStore } from '@/stores/mediaStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { mockMedia, mockWishlist, mockShelves } from '@/data/mockData'
import { Plus, Disc, TrendingUp, Layers, AlertCircle, ChevronRight } from 'lucide-react'
import { formatPrice, getMediaTypeLabel, calculateValueChange } from '@/utils/helpers'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const Dashboard: React.FC = () => {
  const { media, addMedia } = useMediaStore()
  const { wishlist, addWishlistItem } = useWishlistStore()

  // Initialize with mock data if empty
  useEffect(() => {
    if (media.length === 0) {
      mockMedia.forEach(item => {
        const { id, createdAt, updatedAt, value: { valueHistory }, ...rest } = item
        addMedia({
          ...rest,
          value: {
            ...item.value,
            valueHistory: []
          }
        })
      })
    }
    if (wishlist.length === 0) {
      mockWishlist.forEach(item => {
        const { id, createdAt, updatedAt, bidHistory, ...rest } = item
        addWishlistItem({
          ...rest,
          priority: 'high'
        })
      })
    }
  }, [media.length, wishlist.length, addMedia, addWishlistItem])

  // Calculate stats
  const totalItems = media.length
  const lentItems = media.filter(m => m.lending.status === 'lent').length
  const overdueItems = media.filter(m => m.lending.status === 'overdue').length
  const totalValue = media.reduce((sum, m) => sum + m.value.currentEstimate, 0)
  const totalPurchasePrice = media.reduce((sum, m) => sum + m.value.purchasePrice, 0)
  const valueChange = calculateValueChange(totalPurchasePrice, totalValue)
  
  // Recent items
  const recentItems = [...media]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Value history for chart
  const valueHistoryData = [
    { name: '1月', value: totalPurchasePrice * 0.9 },
    { name: '2月', value: totalPurchasePrice * 0.95 },
    { name: '3月', value: totalPurchasePrice * 1.02 },
    { name: '4月', value: totalPurchasePrice * 1.08 },
    { name: '5月', value: totalValue }
  ]

  const statsCards = [
    { title: '总收藏品', value: totalItems, icon: Disc, color: 'from-blue-500 to-cyan-500' },
    { title: '总价值', value: formatPrice(totalValue), icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { title: '借出中', value: lentItems, icon: Layers, color: 'from-orange-500 to-amber-500' },
    { title: '愿望清单', value: wishlist.length, icon: Plus, color: 'from-pink-500 to-rose-500' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            欢迎回来，收藏家
          </h1>
          <p className="text-white/60">
            管理您的实体媒体收藏品
          </p>
        </div>
        <Link
          to="/collections/add"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 transition-all duration-300 hover:scale-105"
        >
          <Plus size={20} />
          添加收藏
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-20 rounded-bl-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500`} />
              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <p className="text-white/60 text-sm mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Value Change */}
      <div className={`rounded-xl p-4 backdrop-blur-sm border ${
        valueChange.isPositive 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className={valueChange.isPositive ? 'text-green-400' : 'text-red-400'} />
          <div>
            <span className={`font-semibold ${
              valueChange.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {valueChange.isPositive ? '+' : ''}{formatPrice(valueChange.change)}
            </span>
            <span className="text-white/60 ml-2">
              ({valueChange.isPositive ? '+' : ''}{valueChange.percentage.toFixed(1)}%) 价值变化
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Value Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              价值趋势
            </h2>
            <Link to="/value" className="flex items-center gap-1 text-[#e94560] text-sm hover:text-[#ff6b6b] transition-colors">
              查看详情 <ChevronRight size={16} />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={valueHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#e94560" 
                  strokeWidth={3}
                  dot={{ fill: '#e94560' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Items */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              最近添加
            </h2>
            <Link to="/collections" className="flex items-center gap-1 text-[#e94560] text-sm hover:text-[#ff6b6b] transition-colors">
              全部 <ChevronRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/collections/${item.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-12 h-16 bg-gradient-to-br from-[#16213e] to-[#0f3460] rounded-lg overflow-hidden flex-shrink-0">
                    {item.coverImage && (
                      <img 
                        src={item.coverImage} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-[#e94560] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {getMediaTypeLabel(item.mediaType)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {formatPrice(item.value.currentEstimate)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Disc size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/50">
                  暂无收藏品
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/collections/add"
          className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#e94560]/50 transition-all duration-300 group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-[#e94560] to-[#ff6b6b] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Plus size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              添加新收藏
            </h3>
            <p className="text-white/50 text-sm">
              条形码扫描或手动录入
            </p>
          </div>
        </Link>

        <Link
          to="/storage"
          className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#e94560]/50 transition-all duration-300 group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Layers size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              存放管理
            </h3>
            <p className="text-white/50 text-sm">
              书架管理和借出记录
            </p>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#e94560]/50 transition-all duration-300 group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <AlertCircle size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              愿望清单
            </h3>
            <p className="text-white/50 text-sm">
              {wishlist.length} 件想要的藏品
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
