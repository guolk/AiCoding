import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Zap, Volume2, ArrowRight, BarChart3 } from 'lucide-react'
import { ScoreDisplay } from '../../components/common/ScoreDisplay'

const practiceModes = [
  {
    id: 'compare',
    title: '发音对比',
    description: '录制你的发音，与标准发音波形实时对比，直观看到差异',
    icon: BarChart3,
    path: '/pronunciation/compare',
    gradient: 'from-blue-400 to-blue-600',
    features: ['波形可视化对比', '发音相似度评分', '逐音节分析']
  },
  {
    id: 'repeat',
    title: '跟读练习',
    description: '播放一句标准发音，暂停后你跟读，AI实时评分发音相似度',
    icon: Volume2,
    path: '/pronunciation/repeat',
    gradient: 'from-green-400 to-green-600',
    features: ['智能断句播放', '实时AI评分', '多维度反馈']
  },
  {
    id: 'speed',
    title: '语速挑战',
    description: '逐渐加快的跟读挑战，提升你的语速和流利度',
    icon: Zap,
    path: '/pronunciation/speed',
    gradient: 'from-amber-400 to-amber-600',
    features: ['5级语速递增', '限时跟读', '流利度评分']
  }
]

export const PronunciationHome: React.FC = () => {
  const [overallScore] = useState(76)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">口语练习</h1>
          <p className="text-gray-500 mt-1">提升你的发音准确度和口语流利度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card lg:col-span-1 flex flex-col items-center justify-center p-8">
          <ScoreDisplay score={overallScore} label="综合口语分" />
          <div className="w-full mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">发音准确度</span>
                <span className="font-medium text-blue-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '78%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">流利度</span>
                <span className="font-medium text-green-600">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: '72%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">语调</span>
                <span className="font-medium text-purple-600">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">节奏</span>
                <span className="font-medium text-amber-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {practiceModes.map((mode) => {
            const Icon = mode.icon
            return (
              <Link
                key={mode.id}
                to={mode.path}
                className="card card-hover group flex items-center gap-6"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${mode.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{mode.title}</h3>
                  <p className="text-gray-500 mb-3">{mode.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {mode.features.map((feature, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-500 rounded-xl flex items-center justify-center transition-all group-hover:translate-x-2">
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">练习小贴士</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-gray-800 mb-1">模仿标准发音</h4>
            <p className="text-sm text-gray-600">仔细听标准发音，注意重音和语调，尽量模仿每个细节</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="text-2xl mb-2">📝</div>
            <h4 className="font-semibold text-gray-800 mb-1">逐句练习</h4>
            <p className="text-sm text-gray-600">不要急于求成，每句话反复练习直到达到满意的分数</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="text-2xl mb-2">⏰</div>
            <h4 className="font-semibold text-gray-800 mb-1">每日坚持</h4>
            <p className="text-sm text-gray-600">每天15-30分钟的口语练习比一周一次长时间练习更有效</p>
          </div>
        </div>
      </div>
    </div>
  )
}
