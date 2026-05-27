import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'

const aromaDescriptors = [
  '黑醋栗', '樱桃', '覆盆子', '蓝莓', '李子',
  '玫瑰', '紫罗兰', '接骨木', '薄荷', '甘草',
  '香草', '焦糖', '巧克力', '咖啡', '烟熏',
  '橡木', '雪松', '皮革', '蘑菇', '森林地表'
]

const tasteDescriptors = [
  '圆润', '饱满', '轻盈', '丝滑', '粗犷',
  '单宁强劲', '单宁柔和', '高酸度', '低酸度',
  '甜美', '干爽', '平衡', '复杂', '简单'
]

export default function TastingForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const bottleId = searchParams.get('bottleId')

  const [wines, setWines] = useState<any[]>([])
  const [bottles, setBottles] = useState<any[]>([])
  const [selectedWineId, setSelectedWineId] = useState('')
  const [selectedBottleId, setSelectedBottleId] = useState(bottleId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    tastingDate: new Date().toISOString().split('T')[0],
    decantingTime: '',
    servingTemp: '',
    pairedFood: '',
    appearanceScore: 85,
    appearanceNotes: '',
    aromaScore: 85,
    aromaNotes: '',
    aromaDescriptors: [] as string[],
    tasteScore: 85,
    tasteNotes: '',
    tasteDescriptors: [] as string[],
    finishScore: 85,
    finishNotes: '',
    overallScore: 85,
    notes: '',
    expectationMatch: 3,
    expectationNotes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedWineId) {
      loadBottles(selectedWineId)
    }
  }, [selectedWineId])

  async function loadData() {
    try {
      const winesData = await api.wines.getAll()
      setWines(winesData)
      if (winesData.length > 0 && !selectedWineId) {
        setSelectedWineId(winesData[0].id)
      }
    } catch (error) {
      console.error('Failed to load data', error)
    }
  }

  async function loadBottles(wineId: string) {
    try {
      const wine = await api.wines.get(wineId)
      const availableBottles = wine.bottles?.filter((b: any) => b.status === 'IN_CELLAR') || []
      setBottles(availableBottles)
      if (availableBottles.length > 0 && !selectedBottleId) {
        setSelectedBottleId(availableBottles[0].id)
      }
    } catch (error) {
      console.error('Failed to load bottles', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBottleId || !selectedWineId) {
      alert('请选择酒款和酒瓶')
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        wineBottleId: selectedBottleId,
        wineId: selectedWineId,
        decantingTime: formData.decantingTime ? parseInt(formData.decantingTime) : null,
        servingTemp: formData.servingTemp ? parseFloat(formData.servingTemp) : null,
        overallScore: Math.round(
          (formData.appearanceScore + formData.aromaScore + formData.tasteScore + formData.finishScore) / 4
        )
      }

      await api.tasting.create(submitData)
      alert('品饮记录保存成功！')
      navigate('/tasting')
    } catch (error) {
      console.error('Failed to create tasting note', error)
      alert('保存失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleDescriptor(type: 'aroma' | 'taste', descriptor: string) {
    const key = type === 'aroma' ? 'aromaDescriptors' : 'tasteDescriptors'
    setFormData(prev => {
      const descriptors = prev[key] as string[]
      if (descriptors.includes(descriptor)) {
        return { ...prev, [key]: descriptors.filter(d => d !== descriptor) }
      } else {
        return { ...prev, [key]: [...descriptors, descriptor] }
      }
    })
  }

  const calculatedOverall = Math.round(
    (formData.appearanceScore + formData.aromaScore + formData.tasteScore + formData.finishScore) / 4
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          ← 返回
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {id ? '编辑品饮记录' : '新品饮记录'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="选择酒款">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">酒款 *</label>
              <select
                value={selectedWineId}
                onChange={(e) => setSelectedWineId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                required
              >
                <option value="">请选择酒款</option>
                {wines.map(wine => (
                  <option key={wine.id} value={wine.id}>
                    {wine.winery} {wine.name} ({wine.vintage})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">酒瓶 *</label>
              <select
                value={selectedBottleId}
                onChange={(e) => setSelectedBottleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                required
              >
                <option value="">请选择酒瓶</option>
                {bottles.map(bottle => (
                  <option key={bottle.id} value={bottle.id}>
                    ¥{bottle.purchasePrice} · {new Date(bottle.purchaseDate).toLocaleDateString('zh-CN')}
                  </option>
                ))}
              </select>
              {selectedWineId && bottles.length === 0 && (
                <p className="text-sm text-red-500 mt-1">该酒款没有可用的在窖酒瓶</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="品饮环境">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">品饮日期</label>
              <input
                type="date"
                value={formData.tastingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, tastingDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">醒酒时间 (分钟)</label>
              <input
                type="number"
                value={formData.decantingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, decantingTime: e.target.value }))}
                placeholder="如：60"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">侍酒温度 (°C)</label>
              <input
                type="number"
                step="0.5"
                value={formData.servingTemp}
                onChange={(e) => setFormData(prev => ({ ...prev, servingTemp: e.target.value }))}
                placeholder="如：18"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">搭配食物</label>
            <input
              type="text"
              value={formData.pairedFood}
              onChange={(e) => setFormData(prev => ({ ...prev, pairedFood: e.target.value }))}
              placeholder="如：烤牛排、意大利面等"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
            />
          </div>
        </Card>

        <Card title="感官评估">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">外观评分</label>
                <span className="text-sm font-semibold text-wine-600">{formData.appearanceScore}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.appearanceScore}
                onChange={(e) => setFormData(prev => ({ ...prev, appearanceScore: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wine-600"
              />
              <input
                type="text"
                value={formData.appearanceNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, appearanceNotes: e.target.value }))}
                placeholder="外观描述..."
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">香气评分</label>
                <span className="text-sm font-semibold text-wine-600">{formData.aromaScore}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.aromaScore}
                onChange={(e) => setFormData(prev => ({ ...prev, aromaScore: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wine-600"
              />
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">香气描述词 (点击选择):</p>
                <div className="flex flex-wrap gap-2">
                  {aromaDescriptors.map(desc => (
                    <button
                      key={desc}
                      type="button"
                      onClick={() => toggleDescriptor('aroma', desc)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        formData.aromaDescriptors.includes(desc)
                          ? 'bg-wine-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {desc}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={formData.aromaNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, aromaNotes: e.target.value }))}
                placeholder="香气描述..."
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">口感评分</label>
                <span className="text-sm font-semibold text-wine-600">{formData.tasteScore}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.tasteScore}
                onChange={(e) => setFormData(prev => ({ ...prev, tasteScore: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wine-600"
              />
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">口感描述词 (点击选择):</p>
                <div className="flex flex-wrap gap-2">
                  {tasteDescriptors.map(desc => (
                    <button
                      key={desc}
                      type="button"
                      onClick={() => toggleDescriptor('taste', desc)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        formData.tasteDescriptors.includes(desc)
                          ? 'bg-wine-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {desc}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={formData.tasteNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, tasteNotes: e.target.value }))}
                placeholder="口感描述..."
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">余韵评分</label>
                <span className="text-sm font-semibold text-wine-600">{formData.finishScore}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.finishScore}
                onChange={(e) => setFormData(prev => ({ ...prev, finishScore: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wine-600"
              />
              <input
                type="text"
                value={formData.finishNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, finishNotes: e.target.value }))}
                placeholder="余韵描述..."
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-wine-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">综合评分 (自动计算)</span>
              <span className="text-3xl font-bold text-wine-600">{calculatedOverall}/100</span>
            </div>
          </div>
        </Card>

        <Card title="品饮笔记">
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="记录您的整体感受..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
          />
        </Card>

        <Card title="预期对比">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">与购买时的期望相比</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, expectationMatch: star }))}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    <span className={star <= formData.expectationMatch ? 'text-yellow-400' : 'text-gray-200'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.expectationMatch === 1 && '远低于预期'}
                {formData.expectationMatch === 2 && '低于预期'}
                {formData.expectationMatch === 3 && '符合预期'}
                {formData.expectationMatch === 4 && '超出预期'}
                {formData.expectationMatch === 5 && '远超预期'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">对比说明</label>
              <textarea
                value={formData.expectationNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, expectationNotes: e.target.value }))}
                rows={2}
                placeholder="说明与预期的差异..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-wine-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 disabled:bg-wine-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存记录'}
          </button>
        </div>
      </form>
    </div>
  )
}
