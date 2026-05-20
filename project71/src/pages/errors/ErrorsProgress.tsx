import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Award, Target, BarChart3, ChevronDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts'
import { progressData, lastWeekProgress } from '../../data/mockData'
import clsx from 'clsx'

export const ErrorsProgress: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  const combinedData = progressData.map((current, idx) => ({
    date: current.date,
    本周发音: current.pronunciation,
    上周发音: lastWeekProgress[idx]?.pronunciation || 0,
    本周语法: current.grammar,
    上周语法: lastWeekProgress[idx]?.grammar || 0,
    本周词汇: current.vocabulary,
    上周词汇: lastWeekProgress[idx]?.vocabulary || 0,
    本周流利度: current.fluency,
    上周流利度: lastWeekProgress[idx]?.fluency || 0
  }))

  const avgThisWeek = progressData[progressData.length - 1]
  const avgLastWeek = lastWeekProgress[lastWeekProgress.length - 1]

  const improvements = [
    { name: '发音', icon: '🎤', current: avgThisWeek.pronunciation, previous: avgLastWeek.pronunciation, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: '语法', icon: '📝', current: avgThisWeek.grammar, previous: avgLastWeek.grammar, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: '词汇', icon: '📚', current: avgThisWeek.vocabulary, previous: avgLastWeek.vocabulary, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: '流利度', icon: '⚡', current: avgThisWeek.fluency, previous: avgLastWeek.fluency, color: 'text-amber-600', bgColor: 'bg-amber-100' }
  ]

  const overallThisWeek = Math.round((avgThisWeek.pronunciation + avgThisWeek.grammar + avgThisWeek.vocabulary + avgThisWeek.fluency) / 4)
  const overallLastWeek = Math.round((avgLastWeek.pronunciation + avgLastWeek.grammar + avgLastWeek.vocabulary + avgLastWeek.fluency) / 4)
  const overallDiff = overallThisWeek - overallLastWeek

  const achievements = [
    { title: '发音突破', description: '发音评分首次突破80分', icon: '🎯', date: '2026-05-18' },
    { title: '连续学习', description: '连续7天坚持练习', icon: '🔥', date: '2026-05-17' },
    { title: '语法达人', description: '语法练习正确率达到90%', icon: '🏆', date: '2026-05-15' },
    { title: '词汇扩充', description: '本周新增120个词汇', icon: '📖', date: '2026-05-14' }
  ]

  const suggestions = [
    { area: '语法', priority: 'high', suggestion: '时态错误仍然是你的主要问题，建议每天做5道时态专项练习' },
    { area: '流利度', priority: 'medium', suggestion: '语速有待提升，建议尝试语速挑战的高级难度' },
    { area: '发音', priority: 'low', suggestion: '发音进步明显，可以开始练习更复杂的单词发音' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/errors" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">进步报告</h1>
          <p className="text-gray-500">对比本周与上周的表现，查看各方面的提升</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'week' | 'month')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 flex items-center gap-2"
          >
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card lg:col-span-1 bg-gradient-to-br from-primary-500 to-blue-600 text-white">
          <p className="text-primary-100 text-sm">综合评分</p>
          <p className="text-4xl font-bold my-2">{overallThisWeek}</p>
          <div className="flex items-center gap-1 text-sm">
            {overallDiff >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span className="text-green-200">+{overallDiff} 分 vs 上周</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4" />
                <span className="text-red-200">{overallDiff} 分 vs 上周</span>
              </>
            )}
          </div>
        </div>

        {improvements.map((item, idx) => {
          const diff = item.current - item.previous
          return (
            <div key={idx} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span className={clsx(
                  'text-sm font-medium flex items-center gap-1',
                  diff >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {diff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {diff >= 0 ? '+' : ''}{diff}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{item.current}</p>
              <p className="text-sm text-gray-500">{item.name}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className={clsx('h-2 rounded-full transition-all duration-500', item.bgColor.replace('100', '500'))}
                  style={{ width: `${item.current}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">能力趋势对比</h2>
            <span className="badge badge-primary">发音评分</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedData}>
                <defs>
                  <linearGradient id="colorThisWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLastWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="本周发音" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorThisWeek)" />
                <Area type="monotone" dataKey="上周发音" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorLastWeek)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">各项能力对比</h2>
            <span className="badge badge-primary">周日数据</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: '发音', 本周: avgThisWeek.pronunciation, 上周: avgLastWeek.pronunciation },
                { name: '语法', 本周: avgThisWeek.grammar, 上周: avgLastWeek.grammar },
                { name: '词汇', 本周: avgThisWeek.vocabulary, 上周: avgLastWeek.vocabulary },
                { name: '流利度', 本周: avgThisWeek.fluency, 上周: avgLastWeek.fluency }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="本周" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="上周" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            提升建议
          </h2>
          <div className="space-y-4">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className={clsx(
                  'p-4 rounded-xl border-2',
                  item.priority === 'high' ? 'border-red-200 bg-red-50' :
                  item.priority === 'medium' ? 'border-amber-200 bg-amber-50' :
                  'border-green-200 bg-green-50'
                )}
              >
                <div className="flex items-start gap-4">
                  <span className={clsx(
                    'px-3 py-1 rounded-lg text-xs font-bold text-white flex-shrink-0',
                    item.priority === 'high' ? 'bg-red-500' :
                    item.priority === 'medium' ? 'bg-amber-500' :
                    'bg-green-500'
                  )}>
                    {item.priority === 'high' ? '高优先级' :
                     item.priority === 'medium' ? '中优先级' : '低优先级'}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{item.area}</h4>
                    <p className="text-gray-600 text-sm">{item.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            本周成就
          </h2>
          <div className="space-y-3">
            {achievements.map((achievement, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
