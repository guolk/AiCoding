import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Mic,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  Globe,
  Home,
  Flame,
  Clock
} from 'lucide-react'
import clsx from 'clsx'
import { userProfile } from '../../data/mockData'

const navItems = [
  { id: 'home', path: '/', icon: Home, label: '首页' },
  { id: 'pronunciation', path: '/pronunciation', icon: Mic, label: '口语练习' },
  { id: 'dialogue', path: '/dialogue', icon: MessageSquare, label: '情景对话' },
  { id: 'vocabulary', path: '/vocabulary', icon: BookOpen, label: '词汇积累' },
  { id: 'errors', path: '/errors', icon: AlertTriangle, label: '错误分析' },
  { id: 'environment', path: '/environment', icon: Globe, label: '语言环境' }
]

export const Sidebar: React.FC = () => {
  const location = useLocation()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
          LangPractice
        </h1>
        <p className="text-sm text-gray-500 mt-1">语言交流练习平台</p>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {userProfile.name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{userProfile.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{userProfile.streak} 天连续学习</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-primary-600">{userProfile.vocabularySize}</p>
            <p className="text-xs text-gray-500">词汇量</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.floor(userProfile.totalPracticeTime / 60)}h
            </p>
            <p className="text-xs text-gray-500">练习时长</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          学习模块
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className={clsx(
                    'w-5 h-5 transition-transform duration-200',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'
                  )} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🏆</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">学习成就</p>
              <p className="text-xs text-amber-600">继续努力！</p>
            </div>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-amber-600 mt-2 text-right">
            距离下一等级还需 350 XP
          </p>
        </div>
      </div>
    </aside>
  )
}
