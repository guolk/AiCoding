import React, { useState } from 'react'
import { BookOpen, Clock, BarChart3, Download, Plus, Settings, Lock, Unlock, X } from 'lucide-react'
import { useStore } from './store/useStore'
import DiaryList from './components/DiaryList'
import DiaryEditor from './components/DiaryEditor'
import DiaryViewer from './components/DiaryViewer'
import MemorySection from './components/MemorySection'
import StatisticsSection from './components/StatisticsSection'
import ExportSection from './components/ExportSection'
import { DiaryEntry } from './types'

type TabType = 'diary' | 'memory' | 'statistics' | 'export'

const App: React.FC = () => {
  const { isLocked, settings, unlock, toggleLock } = useStore()
  const [activeTab, setActiveTab] = useState<TabType>('diary')
  const [showEditor, setShowEditor] = useState(false)
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null)
  const [viewingDiary, setViewingDiary] = useState<DiaryEntry | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const tabs = [
    { id: 'diary' as TabType, label: '日记', icon: BookOpen },
    { id: 'memory' as TabType, label: '回忆', icon: Clock },
    { id: 'statistics' as TabType, label: '统计', icon: BarChart3 },
    { id: 'export' as TabType, label: '导出', icon: Download },
  ]

  const handleEditDiary = (diary: DiaryEntry) => {
    setEditingDiary(diary)
    setShowEditor(true)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingDiary(null)
  }

  const handleSaveDiary = () => {
    handleCloseEditor()
  }

  const handleUnlock = () => {
    if (unlock(passwordInput)) {
      setPasswordInput('')
    }
  }

  const handleSetPassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }
    if (newPassword.length < 4) {
      setPasswordError('密码长度至少4位')
      return
    }
    useStore.getState().setPassword(newPassword)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setShowSettings(false)
  }

  const handleRemovePassword = () => {
    useStore.getState().setPassword(null)
  }

  if (isLocked && settings.password) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={36} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">数字手账</h1>
          <p className="text-gray-500 mb-6">请输入密码解锁</p>
          
          <div className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="输入密码"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-300 focus:outline-none text-center text-lg"
              autoFocus
            />
            <button
              onClick={handleUnlock}
              className="w-full py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              解锁
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50">
      <div className="flex h-screen">
        <aside className="w-20 bg-white shadow-lg flex flex-col items-center py-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-purple-500 rounded-xl flex items-center justify-center mb-8 shadow-md">
            <BookOpen size={24} className="text-white" />
          </div>

          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="space-y-2">
            <button
              onClick={() => setShowSettings(true)}
              className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
            >
              <Settings size={20} />
              <span className="text-xs">设置</span>
            </button>
            
            {settings.password && (
              <button
                onClick={toggleLock}
                className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <Lock size={20} />
                <span className="text-xs">锁定</span>
              </button>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-500">记录生活的每一刻</p>
            </div>
            
            {activeTab === 'diary' && (
              <button
                onClick={() => {
                  setEditingDiary(null)
                  setShowEditor(true)
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all"
              >
                <Plus size={20} />
                写日记
              </button>
            )}
          </header>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'diary' && (
              <DiaryList onSelectDiary={setViewingDiary} onEditDiary={handleEditDiary} />
            )}
            {activeTab === 'memory' && <MemorySection />}
            {activeTab === 'statistics' && <StatisticsSection />}
            {activeTab === 'export' && <ExportSection />}
          </div>
        </main>
      </div>

      {showEditor && (
        <DiaryEditor diary={editingDiary} onClose={handleCloseEditor} onSave={handleSaveDiary} />
      )}

      {viewingDiary && (
        <DiaryViewer diary={viewingDiary} onClose={() => setViewingDiary(null)} />
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings size={20} />
                设置
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Lock size={18} />
                  密码保护
                </h4>

                {settings.password ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-green-600">
                      <Unlock size={16} />
                      <span className="text-sm">密码保护已开启</span>
                    </div>
                    <button
                      onClick={handleRemovePassword}
                      className="w-full py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      关闭密码保护
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">设置密码</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="输入密码"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">确认密码</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="再次输入密码"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none text-sm"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                    <button
                      onClick={handleSetPassword}
                      disabled={!newPassword || !confirmPassword}
                      className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      开启密码保护
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-2">关于</h4>
                <p className="text-sm text-gray-500">
                  数字手账 v1.0
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  记录生活的每一刻美好
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
