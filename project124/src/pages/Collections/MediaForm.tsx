import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMediaStore } from '@/stores/mediaStore'
import { ArrowLeft, Camera, CheckCircle, AlertCircle } from 'lucide-react'
import { MediaItem, MediaType, EditionType, ConditionGrade } from '@/types'
import { getMediaTypeLabel, getEditionLabel, getConditionLabel } from '@/utils/helpers'

const mediaTypes: MediaType[] = ['dvd', 'bluray', 'vinyl', 'cd', 'game']
const editionTypes: EditionType[] = ['standard', 'limited', 'director_cut', 'collector', 'special']
const conditionGrades: ConditionGrade[] = ['mint', 'near_mint', 'very_good', 'good', 'fair', 'poor']

const MediaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { media, addMedia, updateMedia } = useMediaStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  const isEdit = !!id
  const existingMedia = media.find((m) => m.id === id)

  const [formData, setFormData] = useState({
    title: '',
    mediaType: 'dvd' as MediaType,
    barcode: '',
    director: '',
    artist: '',
    publisher: '',
    releaseYear: '',
    genre: '',
    duration: '',
    description: '',
    coverImage: '',
    region: '',
    edition: 'standard' as EditionType,
    editionDescription: '',
    editionFeatures: '',
    coverCondition: 'very_good' as ConditionGrade,
    discCondition: 'very_good' as ConditionGrade,
    bookletCondition: 'very_good' as ConditionGrade,
    overallCondition: 'very_good' as ConditionGrade,
    conditionNotes: '',
    shelf: 1,
    layer: 1,
    position: 1,
    locationNotes: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseChannel: '',
    purchaseNotes: '',
    currentEstimate: '',
    personalScore: 0,
    review: '',
    isRecommended: false,
    recommendedTo: ''
  })

  useEffect(() => {
    if (isEdit && existingMedia) {
      setFormData({
        title: existingMedia.title,
        mediaType: existingMedia.mediaType,
        barcode: existingMedia.barcode || '',
        director: existingMedia.director || '',
        artist: existingMedia.artist || '',
        publisher: existingMedia.publisher || '',
        releaseYear: existingMedia.releaseYear?.toString() || '',
        genre: existingMedia.genre?.join(', ') || '',
        duration: existingMedia.duration?.toString() || '',
        description: existingMedia.description || '',
        coverImage: existingMedia.coverImage || '',
        region: existingMedia.region || '',
        edition: existingMedia.edition,
        editionDescription: existingMedia.editionDescription || '',
        editionFeatures: existingMedia.editionFeatures?.join(', ') || '',
        coverCondition: existingMedia.condition.cover,
        discCondition: existingMedia.condition.disc,
        bookletCondition: existingMedia.condition.booklet,
        overallCondition: existingMedia.condition.overall,
        conditionNotes: existingMedia.condition.notes || '',
        shelf: existingMedia.location.shelf,
        layer: existingMedia.location.layer,
        position: existingMedia.location.position,
        locationNotes: existingMedia.location.notes || '',
        purchasePrice: existingMedia.value.purchasePrice?.toString() || '',
        purchaseDate: existingMedia.value.purchaseDate || new Date().toISOString().split('T')[0],
        purchaseChannel: existingMedia.value.purchaseChannel || '',
        purchaseNotes: existingMedia.value.purchaseNotes || '',
        currentEstimate: existingMedia.value.currentEstimate?.toString() || '',
        personalScore: existingMedia.rating.personalScore,
        review: existingMedia.rating.review || '',
        isRecommended: existingMedia.rating.isRecommended,
        recommendedTo: existingMedia.rating.recommendedTo?.join(', ') || ''
      })
    }
  }, [isEdit, existingMedia])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (name: string, value: number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: '请输入标题' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)
    
    try {
      const mediaData = {
        title: formData.title,
        mediaType: formData.mediaType,
        barcode: formData.barcode || undefined,
        director: formData.director || undefined,
        artist: formData.artist || undefined,
        publisher: formData.publisher || undefined,
        releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : undefined,
        genre: formData.genre ? formData.genre.split(',').map(g => g.trim()).filter(Boolean) : undefined,
        duration: formData.duration ? parseInt(formData.duration) : 0,
        description: formData.description || undefined,
        coverImage: formData.coverImage || undefined,
        region: formData.region || undefined,
        edition: formData.edition,
        editionDescription: formData.editionDescription || undefined,
        editionFeatures: formData.editionFeatures ? formData.editionFeatures.split(',').map(f => f.trim()).filter(Boolean) : undefined,
        condition: {
          cover: formData.coverCondition,
          disc: formData.discCondition,
          booklet: formData.bookletCondition,
          overall: formData.overallCondition,
          notes: formData.conditionNotes || undefined
        },
        location: {
          shelf: formData.shelf,
          layer: formData.layer,
          position: formData.position,
          notes: formData.locationNotes || undefined
        },
        value: {
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
          purchaseDate: formData.purchaseDate,
          purchaseChannel: formData.purchaseChannel || undefined,
          purchaseNotes: formData.purchaseNotes || undefined,
          currentEstimate: formData.currentEstimate ? parseFloat(formData.currentEstimate) : (formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0),
          lastUpdated: new Date().toISOString().split('T')[0],
          valueHistory: []
        },
        rating: {
          personalScore: formData.personalScore,
          review: formData.review || undefined,
          isRecommended: formData.isRecommended,
          recommendedTo: formData.recommendedTo ? formData.recommendedTo.split(',').map(r => r.trim()).filter(Boolean) : undefined,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      }

      if (isEdit && existingMedia) {
        updateMedia(existingMedia.id, {
          ...mediaData,
          lending: existingMedia.lending
        })
        setFeedback({ type: 'success', message: '收藏品已更新！正在跳转...' })
      } else {
        addMedia({
          ...mediaData,
          lending: {
            status: 'available'
          }
        })
        setFeedback({ type: 'success', message: '收藏品添加成功！正在跳转...' })
      }

      setTimeout(() => {
        navigate('/collections')
      }, 800)
    } catch (error) {
      console.error('Submit error:', error)
      setFeedback({ type: 'error', message: '保存失败，请重试' })
      setIsSubmitting(false)
    }
  }

  const handleScanBarcode = () => {
    alert('条形码扫描功能需要相机权限。\n\n在实际应用中，这里会调用相机进行条形码扫描。\n\n请手动输入条形码进行演示。')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/collections')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isEdit ? '编辑收藏品' : '添加新收藏'}
          </h1>
          <p className="text-white/60">
            录入您的实体媒体收藏品
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            基本信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-2">
                标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：星际穿越"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                媒体类型 *
              </label>
              <select
                name="mediaType"
                value={formData.mediaType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
              >
                {mediaTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#1a1a2e]">
                    {getMediaTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                条形码
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                  placeholder="输入或扫描条形码"
                />
                <button
                  type="button"
                  onClick={handleScanBarcode}
                  className="px-4 py-3 bg-[#e94560] hover:bg-[#ff6b6b] rounded-xl transition-colors"
                >
                  <Camera size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                导演 / 艺术家
              </label>
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：克里斯托弗·诺兰"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                发行年份
              </label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：2014"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                类型（用逗号分隔）
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：科幻, 冒险"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                时长（分钟）
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：169"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                封面图片URL
              </label>
              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="图片URL地址"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-2">
                简介
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="输入简介内容"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            版本信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                版本类型
              </label>
              <select
                name="edition"
                value={formData.edition}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
              >
                {editionTypes.map((edition) => (
                  <option key={edition} value={edition} className="bg-[#1a1a2e]">
                    {getEditionLabel(edition)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                版本描述
              </label>
              <input
                type="text"
                name="editionDescription"
                value={formData.editionDescription}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：铁盒限定版"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-2">
                版本特色（用逗号分隔）
              </label>
              <input
                type="text"
                name="editionFeatures"
                value={formData.editionFeatures}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：导演评论音轨, 幕后花絮"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            品相记录
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                封面品相
              </label>
              <select
                name="coverCondition"
                value={formData.coverCondition}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
              >
                {conditionGrades.map((grade) => (
                  <option key={grade} value={grade} className="bg-[#1a1a2e]">
                    {getConditionLabel(grade)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                光碟品相
              </label>
              <select
                name="discCondition"
                value={formData.discCondition}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
              >
                {conditionGrades.map((grade) => (
                  <option key={grade} value={grade} className="bg-[#1a1a2e]">
                    {getConditionLabel(grade)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                手册品相
              </label>
              <select
                name="bookletCondition"
                value={formData.bookletCondition}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
              >
                {conditionGrades.map((grade) => (
                  <option key={grade} value={grade} className="bg-[#1a1a2e]">
                    {getConditionLabel(grade)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                整体品相
              </label>
              <select
                name="overallCondition"
                value={formData.overallCondition}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
              >
                {conditionGrades.map((grade) => (
                  <option key={grade} value={grade} className="bg-[#1a1a2e]">
                    {getConditionLabel(grade)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-2">
                品相备注
              </label>
              <textarea
                name="conditionNotes"
                value={formData.conditionNotes}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="描述品相状况"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            存放位置
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                书架编号
              </label>
              <input
                type="number"
                name="shelf"
                value={formData.shelf}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                min="1"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                层数
              </label>
              <input
                type="number"
                name="layer"
                value={formData.layer}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                min="1"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                位置
              </label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
                min="1"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-white/60 text-sm mb-2">
                位置备注
              </label>
              <textarea
                name="locationNotes"
                value={formData.locationNotes}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：正面朝外"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            价值信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                购入价格
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：280"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                购入日期
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e94560]/50"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                购买渠道
              </label>
              <input
                type="text"
                name="purchaseChannel"
                value={formData.purchaseChannel}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：京东"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                当前估价
              </label>
              <input
                type="number"
                name="currentEstimate"
                value={formData.currentEstimate}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：350"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-2">
                购买备注
              </label>
              <textarea
                name="purchaseNotes"
                value={formData.purchaseNotes}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：618促销价"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            评分和推荐
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">
                个人评分
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={formData.personalScore}
                onChange={(e) => handleNumberChange('personalScore', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-white">
                {formData.personalScore} / 10
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                推荐给（用逗号分隔）
              </label>
              <input
                type="text"
                name="recommendedTo"
                value={formData.recommendedTo}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="例如：张三, 李四"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecommended"
                checked={formData.isRecommended}
                onChange={(e) => handleNumberChange('isRecommended', e.target.checked)}
                className="w-5 h-5 rounded border border-white/30 bg-white/10 text-[#e94560]"
              />
              <label htmlFor="isRecommended" className="ml-2 text-white/60">
                标记为推荐
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 text-sm mb-2">
                观后感
              </label>
              <textarea
                name="review"
                value={formData.review}
                onChange={handleInputChange}
                className="w-full-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]/50"
                placeholder="写下您的观后感..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              feedback.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/collections')}
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-semibold text-white shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? '保存修改' : '添加收藏'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MediaForm
