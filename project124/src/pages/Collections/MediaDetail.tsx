import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMediaStore } from '@/stores/mediaStore'
import { ArrowLeft, Edit, Trash2, Star, MapPin, Calendar, DollarSign, Users, FileText } from 'lucide-react'
import { 
  getMediaTypeLabel, 
  getEditionLabel, 
  getConditionLabel, 
  getLendingStatusLabel,
  getConditionColor,
  getLendingStatusColor,
  formatDate,
  formatPrice,
  calculateValueChange
} from '@/utils/helpers'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const MediaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { media, deleteMedia, returnMedia } = useMediaStore()
  const [showLendModal, setShowLendModal] = useState(false)
  const [borrower, setBorrower] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [notes, setNotes] = useState('')

  const mediaItem = media.find((m) => m.id === id)

  if (!mediaItem) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">
          未找到该收藏品
        </h2>
        <Link to="/collections" className="text-[#e94560] hover:text-[#ff6b6b]">
          返回收藏列表
        </Link>
      </div>
    )
  }

  const valueChange = calculateValueChange(
    mediaItem.value.purchasePrice, 
    mediaItem.value.currentEstimate
  )

  const valueHistoryData = mediaItem.value.valueHistory.map((v, index) => ({
    name: `记录${index + 1}`,
    value: v.estimate,
    date: formatDate(v.date)
  }))

  const handleDelete = () => {
    if (window.confirm('确定要删除这个收藏品吗？')) {
      deleteMedia(mediaItem.id)
      navigate('/collections')
    }
  }

  const handleLend = () => {
    if (!borrower || !expectedReturnDate) return
    useMediaStore.getState().lendMedia(mediaItem.id, {
      borrower,
      expectedReturnDate,
      notes
    })
    setShowLendModal(false)
    setBorrower('')
    setExpectedReturnDate('')
    setNotes('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/collections')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {mediaItem.title}
          </h1>
          <p className="text-white/60">
            {mediaItem.director || mediaItem.artist || ''}
            {mediaItem.releaseYear && ` (${mediaItem.releaseYear})`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/collections/${mediaItem.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <Edit size={20} />
            编辑
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
          >
            <Trash2 size={20} />
            删除
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cover and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
            <div className="aspect-[3/4] bg-gradient-to-br from-[#16213e] to-[#0f3460]">
              {mediaItem.coverImage && (
                <img 
                  src={mediaItem.coverImage} 
                  alt={mediaItem.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-6 space-y-4">
              {/* Type and Edition */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#e94560]/20 text-[#e94560] text-sm rounded-full">
                  {getMediaTypeLabel(mediaItem.mediaType)}
                </span>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">
                  {getEditionLabel(mediaItem.edition)}
                </span>
              </div>

              {/* Duration */}
              {mediaItem.duration > 0 && (
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar size={16} />
                  <span>{mediaItem.duration} 分钟</span>
                </div>
              )}

              {/* Region */}
              {mediaItem.region && (
                <div className="text-white/60">
                  <span className="text-white/40">地区：</span>
                  {mediaItem.region}
                </div>
              )}

              {/* Genre */}
              {mediaItem.genre && mediaItem.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mediaItem.genre.map((g, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-md"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              {mediaItem.rating.personalScore > 0 && (
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-400" />
                  <span className="text-amber-400 font-semibold">
                    {mediaItem.rating.personalScore.toFixed(1)}
                  </span>
                  <span className="text-white/40 text-sm">/ 10</span>
                  {mediaItem.rating.isRecommended && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      已推荐
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {mediaItem.description && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                简介
              </h2>
              <p className="text-white/70 leading-relaxed">
                {mediaItem.description}
              </p>
            </div>
          )}

          {/* Condition */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              品相记录
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">封面</p>
                <p className={`font-semibold ${getConditionColor(mediaItem.condition.cover)}`}>
                  {getConditionLabel(mediaItem.condition.cover)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">光碟</p>
                <p className={`font-semibold ${getConditionColor(mediaItem.condition.disc)}`}>
                  {getConditionLabel(mediaItem.condition.disc)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">手册</p>
                <p className={`font-semibold ${getConditionColor(mediaItem.condition.booklet)}`}>
                  {getConditionLabel(mediaItem.condition.booklet)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">整体</p>
                <p className={`font-semibold ${getConditionColor(mediaItem.condition.overall)}`}>
                  {getConditionLabel(mediaItem.condition.overall)}
                </p>
              </div>
            </div>
            {mediaItem.condition.notes && (
              <p className="mt-4 text-white/50 text-sm">
                <FileText size={14} className="inline mr-2" />
                {mediaItem.condition.notes}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              存放位置
            </h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    第 {mediaItem.location.shelf} 书架
                  </p>
                  <p className="text-white/60">
                    第 {mediaItem.location.layer} 层，第 {mediaItem.location.position} 位
                  </p>
                </div>
              </div>
            </div>
            {mediaItem.location.notes && (
              <p className="mt-4 text-white/50 text-sm">
                {mediaItem.location.notes}
              </p>
            )}
          </div>

          {/* Lending Status */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                借出状态
              </h2>
              {mediaItem.lending.status === 'available' ? (
                <button
                  onClick={() => setShowLendModal(true)}
                  className="px-4 py-2 bg-[#e94560] hover:bg-[#ff6b6b] rounded-xl transition-colors"
                >
                  借出
                </button>
              ) : (
                <button
                  onClick={() => returnMedia(mediaItem.id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl transition-colors"
                >
                  标记归还
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                mediaItem.lending.status === 'available' 
                  ? 'bg-green-500/20' 
                  : 'bg-orange-500/20'
              }`}>
                <Users size={24} className={getLendingStatusColor(mediaItem.lending.status)} />
              </div>
              <div>
                <p className={`font-semibold ${getLendingStatusColor(mediaItem.lending.status)}`}>
                  {getLendingStatusLabel(mediaItem.lending.status)}
                </p>
                {mediaItem.lending.borrower && (
                  <p className="text-white/60 text-sm">
                    借给：{mediaItem.lending.borrower}
                  </p>
                )}
                {mediaItem.lending.expectedReturnDate && (
                  <p className="text-white/40 text-sm">
                    预计归还：{formatDate(mediaItem.lending.expectedReturnDate)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Value Tracking */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              价值追踪
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">购入价格</p>
                <p className="text-white font-semibold">
                  {formatPrice(mediaItem.value.purchasePrice)}
                </p>
                {mediaItem.value.purchaseDate && (
                  <p className="text-white/40 text-xs">
                    {formatDate(mediaItem.value.purchaseDate)}
                  </p>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">当前估价</p>
                <p className="text-white font-semibold">
                  {formatPrice(mediaItem.value.currentEstimate)}
                </p>
                <p className="text-white/40 text-xs">
                  更新于 {formatDate(mediaItem.value.lastUpdated)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">价值变化</p>
                <p className={`font-semibold ${valueChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {valueChange.isPositive ? '+' : ''}{formatPrice(valueChange.change)}
                </p>
                <p className={`text-xs ${valueChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {valueChange.isPositive ? '+' : ''}{valueChange.percentage.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-sm mb-1">购买渠道</p>
                <p className="text-white font-semibold">
                  {mediaItem.value.purchaseChannel || '未知'}
                </p>
                {mediaItem.value.purchaseNotes && (
                  <p className="text-white/40 text-xs">
                    {mediaItem.value.purchaseNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Value Chart */}
            {valueHistoryData.length > 0 && (
              <div className="h-48">
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
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Review */}
          {mediaItem.rating.review && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                观后感
              </h2>
              <p className="text-white/70 leading-relaxed">
                {mediaItem.rating.review}
              </p>
              {mediaItem.rating.recommendedTo && mediaItem.rating.recommendedTo.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/40 text-sm mb-2">
                    推荐给：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mediaItem.rating.recommendedTo.map((person, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#e94560]/20 text-[#e94560] text-sm rounded-full"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edition Features */}
          {mediaItem.editionFeatures && mediaItem.editionFeatures.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                版本特色
              </h2>
              {mediaItem.editionDescription && (
                <p className="text-white/60 mb-4">
                  {mediaItem.editionDescription}
                </p>
              )}
              <ul className="space-y-2">
                {mediaItem.editionFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-white/70">
                    <span className="w-2 h-2 bg-[#e94560] rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Lend Modal */}
      {showLendModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6">
              借出记录
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  借用人
                </label>
                <input
                  type="text"
                  value={borrower}
                  onChange={(e) => setBorrower(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="请输入借用人姓名"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  预计归还日期
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  备注
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="可选备注信息"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowLendModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLend}
                disabled={!borrower || !expectedReturnDate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认借出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaDetail
