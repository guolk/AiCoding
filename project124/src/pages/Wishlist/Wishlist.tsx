import React, { useState } from 'react'
import { useWishlistStore } from '@/stores/wishlistStore'
import { Heart, Plus, Edit, Trash2, Target, DollarSign, Calendar, Tag, X, Check } from 'lucide-react'
import { WishlistItem, MediaType, Priority, BidStatus } from '@/types'
import { getMediaTypeLabel, getPriorityLabel, getPriorityColor, getBidStatusLabel, formatPrice, formatDate } from '@/utils/helpers'

const mediaTypes: MediaType[] = ['dvd', 'bluray', 'vinyl', 'cd', 'game']
const priorities: Priority[] = ['high', 'medium', 'low']
const bidStatuses: BidStatus[] = ['active', 'won', 'lost', 'expired']

const Wishlist: React.FC = () => {
  const { wishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem, addBidRecord } = useWishlistStore()
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    mediaType: 'dvd' as MediaType,
    targetMin: '',
    targetMax: '',
    currentMarketPrice: '',
    priority: 'medium' as Priority,
    notes: ''
  })

  const [bidFormData, setBidFormData] = useState({
    price: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active' as BidStatus,
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingItem) {
      updateWishlistItem(editingItem.id, {
        title: formData.title,
        mediaType: formData.mediaType,
        targetPrice: {
          min: parseFloat(formData.targetMin) || 0,
          max: parseFloat(formData.targetMax) || 0
        },
        currentMarketPrice: formData.currentMarketPrice ? parseFloat(formData.currentMarketPrice) : undefined,
        priority: formData.priority,
        notes: formData.notes || undefined
      })
    } else {
      addWishlistItem({
        title: formData.title,
        mediaType: formData.mediaType,
        targetPrice: {
          min: parseFloat(formData.targetMin) || 0,
          max: parseFloat(formData.targetMax) || 0
        },
        currentMarketPrice: formData.currentMarketPrice ? parseFloat(formData.currentMarketPrice) : undefined,
        priority: formData.priority,
        notes: formData.notes || undefined
      })
    }

    setShowModal(false)
    setEditingItem(null)
    resetForm()
  }

  const handleAddBid = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWishlistId) return

    addBidRecord({
      wishlistId: selectedWishlistId,
      price: parseFloat(bidFormData.price),
      source: bidFormData.source,
      date: bidFormData.date,
      status: bidFormData.status,
      notes: bidFormData.notes || undefined
    })

    setShowBidModal(false)
    setSelectedWishlistId(null)
    resetBidForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      mediaType: 'dvd',
      targetMin: '',
      targetMax: '',
      currentMarketPrice: '',
      priority: 'medium',
      notes: ''
    })
  }

  const resetBidForm = () => {
    setBidFormData({
      price: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: ''
    })
  }

  const openEditModal = (item: WishlistItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      mediaType: item.mediaType,
      targetMin: item.targetPrice.min.toString(),
      targetMax: item.targetPrice.max.toString(),
      currentMarketPrice: item.currentMarketPrice?.toString() || '',
      priority: item.priority,
      notes: item.notes || ''
    })
    setShowModal(true)
  }

  const openBidModal = (wishlistId: string) => {
    setSelectedWishlistId(wishlistId)
    setShowBidModal(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个愿望清单项目吗？')) {
      deleteWishlistItem(id)
    }
  }

  // Sort by priority
  const sortedWishlist = [...wishlist].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            愿望清单
          </h1>
          <p className="text-white/60">
            管理您想要购入的收藏品
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 transition-all duration-300 hover:scale-105"
        >
          <Plus size={20} />
          添加愿望
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">愿望总数</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {wishlist.length}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">高优先级</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {wishlist.filter(w => w.priority === 'high').length}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Check size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">已得标</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {wishlist.filter(w => w.bidHistory.some(b => b.status === 'won')).length}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <p className="text-white/60 text-sm">总目标预算</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatPrice(wishlist.reduce((sum, w) => sum + w.targetPrice.max, 0))}
          </p>
        </div>
      </div>

      {/* Wishlist Items */}
      {sortedWishlist.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
            <Heart size={48} className="text-white/20" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            愿望清单为空
          </h3>
          <p className="text-white/50 mb-6">
            添加您想要购入的收藏品到愿望清单
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 transition-all"
          >
            <Plus size={20} />
            添加第一个愿望
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWishlist.map((item) => {
            const isWithinBudget = item.currentMarketPrice 
              ? item.currentMarketPrice <= item.targetPrice.max
              : true
            const activeBids = item.bidHistory.filter(b => b.status === 'active').length
            
            return (
              <div 
                key={item.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#e94560]/30 transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'high' 
                          ? 'bg-red-500/20 text-red-400' 
                          : item.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {getPriorityLabel(item.priority)} 优先级
                      </span>
                      <span className="px-3 py-1 bg-[#e94560]/20 text-[#e94560] rounded-full text-xs font-medium">
                        {getMediaTypeLabel(item.mediaType)}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Edit size={16} className="text-white/60" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4">
                    {item.title}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Target size={16} className="text-white/40" />
                      <span className="text-white/40">目标价格：</span>
                      <span className="text-white font-medium">
                        {formatPrice(item.targetPrice.min)} - {formatPrice(item.targetPrice.max)}
                      </span>
                    </div>
                    
                    {item.currentMarketPrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-white/40" />
                        <span className="text-white/40">当前市价：</span>
                        <span className={`font-medium ${
                          isWithinBudget ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPrice(item.currentMarketPrice)}
                          {isWithinBudget ? ' ✓' : ' (超出预算)'}
                        </span>
                      </div>
                    )}

                    {activeBids > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-white/40" />
                        <span className="text-white/40">进行中的出价：</span>
                        <span className="text-blue-400 font-medium">
                          {activeBids} 个
                        </span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-white/50 text-sm mb-4">
                      {item.notes}
                    </p>
                  )}

                  <button
                    onClick={() => openBidModal(item.id)}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors"
                  >
                    添加出价记录
                  </button>
                </div>

                {/* Bid History */}
                {item.bidHistory.length > 0 && (
                  <div className="border-t border-white/10 p-4">
                    <h4 className="text-white/60 text-sm font-medium mb-3">
                      出价记录
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {item.bidHistory.map((bid) => (
                        <div 
                          key={bid.id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">
                              {formatPrice(bid.price)}
                            </p>
                            <p className="text-white/40 text-xs">
                              {bid.source} · {formatDate(bid.date)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            bid.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                            bid.status === 'won' ? 'bg-green-500/20 text-green-400' :
                            bid.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {getBidStatusLabel(bid.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingItem ? '编辑愿望' : '添加愿望'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="例如：盗梦空间 4K UHD"
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  媒体类型
                </label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData(prev => ({ ...prev, mediaType: e.target.value as MediaType }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                >
                  {mediaTypes.map(type => (
                    <option key={type} value={type} className="bg-[#1a1a2e]">
                      {getMediaTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    目标最低价
                  </label>
                  <input
                    type="number"
                    value={formData.targetMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetMin: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    目标最高价
                  </label>
                  <input
                    type="number"
                    value={formData.targetMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetMax: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  当前市价
                </label>
                <input
                  type="number"
                  value={formData.currentMarketPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentMarketPrice: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="可选"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  优先级
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                >
                  {priorities.map(p => (
                    <option key={p} value={p} className="bg-[#1a1a2e]">
                      {getPriorityLabel(p)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="可选备注"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white"
                >
                  {editingItem ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                添加出价记录
              </h3>
              <button
                onClick={() => {
                  setShowBidModal(false)
                  setSelectedWishlistId(null)
                  resetBidForm()
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>
            
            <form onSubmit={handleAddBid} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  出价金额 *
                </label>
                <input
                  type="number"
                  value={bidFormData.price}
                  onChange={(e) => setBidFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="例如：250"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  出价来源 *
                </label>
                <input
                  type="text"
                  value={bidFormData.source}
                  onChange={(e) => setBidFormData(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="例如：闲鱼、淘宝、Discogs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    出价日期
                  </label>
                  <input
                    type="date"
                    value={bidFormData.date}
                    onChange={(e) => setBidFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    状态
                  </label>
                  <select
                    value={bidFormData.status}
                    onChange={(e) => setBidFormData(prev => ({ ...prev, status: e.target.value as BidStatus }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                  >
                    {bidStatuses.map(status => (
                      <option key={status} value={status} className="bg-[#1a1a2e]">
                        {getBidStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  备注
                </label>
                <textarea
                  value={bidFormData.notes}
                  onChange={(e) => setBidFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="可选备注"
                  rows={2}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBidModal(false)
                    setSelectedWishlistId(null)
                    resetBidForm()
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wishlist
