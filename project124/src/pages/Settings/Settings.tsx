import React from 'react'
import { useMediaStore } from '@/stores/mediaStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { Settings as SettingsIcon, Download, Upload, Trash2, Database, Info } from 'lucide-react'
import { downloadJSON } from '@/utils/helpers'

const Settings: React.FC = () => {
  const { media } = useMediaStore()
  const { wishlist } = useWishlistStore()

  const handleExport = () => {
    const exportData = {
      media,
      wishlist,
      exportedAt: new Date().toISOString()
    }
    downloadJSON(exportData, `media-vault-backup-${new Date().toISOString().split('T')[0]}.json`)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        
        if (data.media && Array.isArray(data.media)) {
          data.media.forEach((item: any) => {
            const existing = media.find(m => m.id === item.id)
            if (!existing) {
              useMediaStore.getState().addMedia({
                ...item,
                value: {
                  ...item.value,
                  valueHistory: []
                }
              })
            }
          })
        }
        
        if (data.wishlist && Array.isArray(data.wishlist)) {
          data.wishlist.forEach((item: any) => {
            const existing = wishlist.find(w => w.id === item.id)
            if (!existing) {
              useWishlistStore.getState().addWishlistItem({
                ...item,
                priority: 'medium'
              })
            }
          })
        }
        
        alert('导入成功！')
      } catch (error) {
        alert('导入失败，请确保文件格式正确。')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearAll = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      if (window.confirm('再次确认：真的要删除所有数据吗？')) {
        localStorage.removeItem('media-collection-store')
        localStorage.removeItem('wishlist-store')
        localStorage.removeItem('shelf-store')
        window.location.reload()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          设置
        </h1>
        <p className="text-white/60">
          管理您的应用设置和数据
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <Database size={24} className="text-[#e94560]" />
          <h2 className="text-xl font-semibold text-white">
            数据管理
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">导出数据</p>
              <p className="text-white/40 text-sm">将所有数据导出为 JSON 文件备份</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#e94560] hover:bg-[#ff6b6b] rounded-xl transition-colors"
            >
              <Download size={18} />
              导出
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">导入数据</p>
              <p className="text-white/40 text-sm">从 JSON 文件导入数据</p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl cursor-pointer transition-colors">
              <Upload size={18} />
              导入
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">清除所有数据</p>
              <p className="text-white/40 text-sm">删除所有收藏和愿望清单数据</p>
            </div>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
            >
              <Trash2 size={18} />
              清除
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <Info size={24} className="text-blue-400" />
          <h2 className="text-xl font-semibold text-white">
            数据统计
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <p className="text-3xl font-bold text-white mb-1">
              {media.length}
            </p>
            <p className="text-white/40 text-sm">收藏品</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <p className="text-3xl font-bold text-white mb-1">
              {wishlist.length}
            </p>
            <p className="text-white/40 text-sm">愿望清单</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <p className="text-3xl font-bold text-white mb-1">
              {media.filter(m => m.rating.personalScore > 0).length}
            </p>
            <p className="text-white/40 text-sm">已评分</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <p className="text-3xl font-bold text-white mb-1">
              {media.filter(m => m.rating.isRecommended).length}
            </p>
            <p className="text-white/40 text-sm">已推荐</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon size={24} className="text-purple-400" />
          <h2 className="text-xl font-semibold text-white">
            关于
          </h2>
        </div>
        
        <div className="space-y-4 text-white/60">
          <div>
            <p className="text-white font-medium mb-1">收藏家 Media Vault</p>
            <p className="text-sm">版本 1.0.0</p>
          </div>
          <div>
            <p className="text-white font-medium mb-1">功能</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>收藏档案管理</li>
              <li>存放位置管理</li>
              <li>价值追踪</li>
              <li>愿望清单</li>
              <li>评分和推荐</li>
              <li>借出管理</li>
            </ul>
          </div>
          <div>
            <p className="text-white font-medium mb-1">数据存储</p>
            <p className="text-sm">所有数据存储在本地浏览器中，请定期导出备份以防止数据丢失。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
