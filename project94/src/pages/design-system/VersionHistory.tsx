import { useState } from 'react'
import { versionHistory as initialVersionHistory } from '../../data/mockData'
import { cn } from '../../utils/cn'
import { Plus, User, Calendar, Tag, X, Plus as PlusIcon } from 'lucide-react'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import type { VersionRecord, ChangeItem } from '../../types'

const changeTypeConfig = {
  add: { label: '新增', color: 'bg-green-100 text-green-700' },
  modify: { label: '修改', color: 'bg-amber-100 text-amber-700' },
  delete: { label: '删除', color: 'bg-red-100 text-red-700' },
}

export default function VersionHistory() {
  const [versionHistory, setVersionHistory] = useState<VersionRecord[]>(initialVersionHistory)
  const [modalVisible, setModalVisible] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastMessage, setToastMessage] = useState('')
  const [formData, setFormData] = useState({
    version: '',
    author: '',
    description: '',
    changes: [] as ChangeItem[],
    impactScope: [] as string[],
  })
  const [newChange, setNewChange] = useState<ChangeItem>({
    type: 'modify',
    item: '',
    detail: '',
  })
  const [newImpact, setNewImpact] = useState('')

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToastType(type)
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleAddChange = () => {
    if (newChange.item && newChange.detail) {
      setFormData(prev => ({
        ...prev,
        changes: [...prev.changes, { ...newChange }]
      }))
      setNewChange({ type: 'modify', item: '', detail: '' })
    }
  }

  const handleRemoveChange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index)
    }))
  }

  const handleAddImpact = () => {
    if (newImpact.trim() && !formData.impactScope.includes(newImpact.trim())) {
      setFormData(prev => ({
        ...prev,
        impactScope: [...prev.impactScope, newImpact.trim()]
      }))
      setNewImpact('')
    }
  }

  const handleRemoveImpact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      impactScope: prev.impactScope.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    if (!formData.version.trim()) {
      showToast('error', '请填写版本号！')
      return
    }
    if (!formData.author.trim()) {
      showToast('error', '请填写发布人！')
      return
    }
    if (formData.changes.length === 0) {
      showToast('error', '请至少添加一条变更内容！')
      return
    }

    const newVersion: VersionRecord = {
      id: String(Date.now()),
      version: formData.version,
      date: new Date().toISOString().split('T')[0],
      author: formData.author,
      description: formData.description,
      changes: formData.changes,
      impactScope: formData.impactScope,
    }

    setVersionHistory(prev => [newVersion, ...prev])
    setModalVisible(false)
    showToast('success', '版本发布成功！')
    setFormData({
      version: '',
      author: '',
      description: '',
      changes: [],
      impactScope: [],
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">版本历史</h1>
          <p className="mt-1 text-gray-600">设计规范的变更记录和影响范围</p>
        </div>
        <button
          onClick={() => setModalVisible(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          发布新版本
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-8">
          {versionHistory.map((version, index) => (
            <div key={version.id} className="relative pl-12">
              <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{versionHistory.length - index}</span>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <Tag className="w-4 h-4" />
                          v{version.version}
                        </span>
                        <span className="text-gray-500 text-sm">{version.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {version.author}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {version.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">变更内容</h4>
                    <div className="space-y-2">
                      {version.changes.map((change, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className={cn(
                            'px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0',
                            changeTypeConfig[change.type].color
                          )}>
                            {changeTypeConfig[change.type].label}
                          </span>
                          <div>
                            <span className="font-mono text-sm text-gray-700">{change.item}</span>
                            <p className="text-sm text-gray-600 mt-0.5">{change.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">影响范围</h4>
                    <div className="flex flex-wrap gap-2">
                      {version.impactScope.map((scope, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        visible={modalVisible}
        title="发布新版本"
        onClose={() => setModalVisible(false)}
        onConfirm={handleSubmit}
        confirmText="发布"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                版本号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="例如: 2.2.0"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                发布人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="例如: 张三"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              版本说明
            </label>
            <textarea
              placeholder="描述本次版本更新的主要内容..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              变更内容 <span className="text-red-500">*</span>
            </label>
            
            {formData.changes.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.changes.map((change, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0',
                      changeTypeConfig[change.type].color
                    )}>
                      {changeTypeConfig[change.type].label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{change.item}</p>
                      <p className="text-xs text-gray-500 truncate">{change.detail}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveChange(i)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mb-2">
              <select
                value={newChange.type}
                onChange={(e) => setNewChange(prev => ({ ...prev, type: e.target.value as ChangeItem['type'] }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="add">新增</option>
                <option value="modify">修改</option>
                <option value="delete">删除</option>
              </select>
              <input
                type="text"
                placeholder="变更项名称"
                value={newChange.item}
                onChange={(e) => setNewChange(prev => ({ ...prev, item: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="变更详情"
                value={newChange.detail}
                onChange={(e) => setNewChange(prev => ({ ...prev, detail: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={handleAddChange}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              影响范围
            </label>
            
            {formData.impactScope.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.impactScope.map((scope, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    {scope}
                    <button
                      onClick={() => handleRemoveImpact(i)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例如: 所有按钮组件"
                value={newImpact}
                onChange={(e) => setNewImpact(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImpact())}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={handleAddImpact}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Toast
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  )
}