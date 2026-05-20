import React, { useState } from 'react'
import { Search, Bell, Settings, ChevronDown, HelpCircle, LogOut } from 'lucide-react'

export const Navbar: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications] = useState([
    { id: 1, text: '继续昨天的口语练习', time: '10分钟前', read: false },
    { id: 2, text: '你有3个语法错误需要复习', time: '1小时前', read: false },
    { id: 3, text: '本周进步报告已生成', time: '昨天', read: true }
  ])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-xl w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索单词、短语、对话场景..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        <button className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
          <Settings className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              L
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                设置
              </button>
              <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                帮助中心
              </button>
              <hr className="my-2 border-gray-100" />
              <button className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
