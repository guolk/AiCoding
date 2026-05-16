import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Download, FileText, Archive, Lock, Check, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useStore } from '../store/useStore'

const ExportSection: React.FC = () => {
  const { diaries } = useStore()
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [includePhotos, setIncludePhotos] = useState(true)
  const [includeDrawings, setIncludeDrawings] = useState(true)
  const [password, setPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const years = Array.from(new Set(diaries.map((d) => parseISO(d.date).getFullYear()))).sort(
    (a, b) => b - a
  )

  const months = [
    { value: '1', label: '一月' },
    { value: '2', label: '二月' },
    { value: '3', label: '三月' },
    { value: '4', label: '四月' },
    { value: '5', label: '五月' },
    { value: '6', label: '六月' },
    { value: '7', label: '七月' },
    { value: '8', label: '八月' },
    { value: '9', label: '九月' },
    { value: '10', label: '十月' },
    { value: '11', label: '十一月' },
    { value: '12', label: '十二月' },
  ]

  const filteredDiaries = diaries.filter((diary) => {
    const date = parseISO(diary.date)
    const yearMatch = selectedYear === 'all' || date.getFullYear().toString() === selectedYear
    const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth
    return yearMatch && monthMatch
  })

  const exportToPDF = async () => {
    setExporting(true)

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      doc.setFontSize(24)
      doc.setTextColor(168, 85, 247)
      doc.text('我的手账日记', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      const dateRange =
        selectedYear === 'all'
          ? '全部日记'
          : `${selectedYear}年${selectedMonth === 'all' ? '' : selectedMonth + '月'}`
      doc.text(`导出时间：${format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}`, pageWidth / 2, yPosition, {
        align: 'center',
      })
      yPosition += 10
      doc.text(`范围：${dateRange}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10
      doc.text(`共 ${filteredDiaries.length} 篇日记`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      for (let i = 0; i < filteredDiaries.length; i++) {
        const diary = filteredDiaries[i]

        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        doc.setDrawColor(200, 200, 200)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 10

        if (diary.mood) {
          doc.setFontSize(20)
          doc.text(diary.mood.emoji, margin, yPosition)
        }

        doc.setFontSize(16)
        doc.setTextColor(50, 50, 50)
        doc.text(diary.title, margin + (diary.mood ? 15 : 0), yPosition)
        yPosition += 8

        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text(
          format(parseISO(diary.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN }),
          margin,
          yPosition
        )
        yPosition += 8

        if (diary.weather) {
          doc.setFontSize(12)
          doc.setTextColor(100, 100, 100)
          doc.text(`${diary.weather.icon} ${diary.weather.condition}`, margin, yPosition)
          yPosition += 8
        }

        doc.setFontSize(11)
        doc.setTextColor(70, 70, 70)
        const content = diary.content.replace(/<[^>]*>/g, '')
        const lines = doc.splitTextToSize(content, pageWidth - margin * 2)

        for (const line of lines) {
          if (yPosition > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += 6
        }

        if (diary.tags.length > 0) {
          yPosition += 4
          doc.setFontSize(9)
          doc.setTextColor(168, 85, 247)
          doc.text(`标签: ${diary.tags.map((t) => '#' + t).join(' ')}`, margin, yPosition)
          yPosition += 10
        }

        yPosition += 10
      }

      doc.save(`手账日记_${format(new Date(), 'yyyyMMdd')}.pdf`)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export error:', error)
      alert('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      diaries: filteredDiaries,
      version: '1.0',
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `手账日记备份_${format(new Date(), 'yyyyMMdd')}.json`
    a.click()
    URL.revokeObjectURL(url)

    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 3000)
  }

  const exportEncryptedBackup = () => {
    if (!password) {
      setShowPasswordModal(true)
      return
    }

    const data = {
      exportedAt: new Date().toISOString(),
      diaries: diaries,
      encrypted: true,
    }

    const jsonStr = JSON.stringify(data)
    const encoder = new TextEncoder()
    const dataArr = encoder.encode(jsonStr)
    const passArr = encoder.encode(password)
    const encrypted = dataArr.map((byte, i) => byte ^ passArr[i % passArr.length])

    const blob = new Blob([encrypted], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `手账日记加密备份_${format(new Date(), 'yyyyMMdd')}.journal`
    a.click()
    URL.revokeObjectURL(url)

    setPassword('')
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 3000)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">导出设置</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">选择年份</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none"
              >
                <option value="all">全部年份</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}年
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">选择月份</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none"
              >
                <option value="all">全部月份</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            已选择 <span className="text-primary-600 font-medium">{filteredDiaries.length}</span> 篇日记进行导出
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">导出选项</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">包含照片</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDrawings}
                onChange={(e) => setIncludeDrawings(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">包含手绘</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 card-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">导出为 PDF</h3>
                  <p className="text-sm text-gray-500">精美排版的电子手账</p>
                </div>
              </div>
              <button
                onClick={exportToPDF}
                disabled={exporting || filteredDiaries.length === 0}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                {exporting ? '导出中...' : '导出 PDF'}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 card-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Archive className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">导出合集备份</h3>
                  <p className="text-sm text-gray-500">JSON 格式，可随时导入恢复</p>
                </div>
              </div>
              <button
                onClick={exportToJSON}
                disabled={filteredDiaries.length === 0}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                导出备份
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 card-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <Lock className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">加密备份</h3>
                  <p className="text-sm text-gray-500">密码保护，安全存储</p>
                </div>
              </div>
              <button
                onClick={exportEncryptedBackup}
                disabled={diaries.length === 0}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                加密备份
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">💡 提示</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 建议定期备份您的日记数据</li>
            <li>• 加密备份需要牢记密码，忘记密码无法恢复</li>
            <li>• PDF 导出保留日记排版和格式</li>
            <li>• JSON 备份可以完整恢复所有数据</li>
          </ul>
        </div>
      </div>

      {exportSuccess && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check size={20} />
          导出成功！
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">设置加密密码</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPassword('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">加密密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请设置密码"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-300 focus:outline-none"
                />
              </div>

              <p className="text-sm text-gray-500">
                ⚠️ 请务必牢记密码，忘记密码将无法恢复备份数据
              </p>

              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  if (password) {
                    exportEncryptedBackup()
                  }
                }}
                disabled={!password}
                className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                确认加密备份
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportSection
