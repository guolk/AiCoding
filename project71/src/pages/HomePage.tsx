import React from 'react'
import { Link } from 'react-router-dom'
import {
  Mic,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  Globe,
  TrendingUp,
  Target,
  Award,
  ChevronRight,
  Play,
  Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { progressData, userProfile, dialogueScenarios, practiceSentences } from '../data/mockData'

const moduleCards = [
  {
    id: 'pronunciation',
    title: '口语练习',
    description: '发音对比、跟读练习、语速挑战，全方位提升口语能力',
    icon: Mic,
    path: '/pronunciation',
    gradient: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500'
  },
  {
    id: 'dialogue',
    title: '情景对话',
    description: '餐厅、问路、购物、就医、工作会议等真实场景练习',
    icon: MessageSquare,
    path: '/dialogue',
    gradient: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500'
  },
  {
    id: 'vocabulary',
    title: '词汇积累',
    description: '词组收藏、表达归类、搭配练习，高效扩充词汇量',
    icon: BookOpen,
    path: '/vocabulary',
    gradient: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500'
  },
  {
    id: 'errors',
    title: '错误分析',
    description: '语法纠正、个人错误本、进步报告，针对性提升',
    icon: AlertTriangle,
    path: '/errors',
    gradient: 'from-amber-400 to-amber-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-500'
  },
  {
    id: 'environment',
    title: '语言环境',
    description: '每日新闻精听、原声视频推荐，沉浸式学习体验',
    icon: Globe,
    path: '/environment',
    gradient: 'from-rose-400 to-rose-600',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-500'
  }
]

export const HomePage: React.FC = () => {
  const todaySentence = practiceSentences[Math.floor(Math.random() * practiceSentences.length)]

  const speakSentence = () => {
    const utterance = new SpeechSynthesisUtterance(todaySentence.text)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-primary-100 text-sm font-medium">欢迎回来，继续你的学习之旅！</p>
          <h1 className="text-3xl font-bold mt-2 mb-4">
            你好，{userProfile.name}！👋
          </h1>
          <p className="text-primary-100 mb-6 max-w-xl">
            坚持学习 {userProfile.streak} 天，累计练习 {Math.floor(userProfile.totalPracticeTime / 60)} 小时，
            继续保持，你已经超越了 85% 的学习者！
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/pronunciation"
              className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Play className="w-5 h-5" />
              开始今日练习
            </Link>
            <Link
              to="/errors"
              className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30"
            >
              <Target className="w-5 h-5" />
              查看错误本
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">本周平均分</p>
            <p className="text-2xl font-bold text-gray-800">78.5</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +8.2% vs 上周
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">词汇量</p>
            <p className="text-2xl font-bold text-gray-800">{userProfile.vocabularySize}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +120 本周新增
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">本周练习</p>
            <p className="text-2xl font-bold text-gray-800">4.5h</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 目标 5h
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center">
            <Award className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">连续学习</p>
            <p className="text-2xl font-bold text-gray-800">{userProfile.streak}天</p>
            <p className="text-xs text-amber-600 flex items-center gap-1">
              ⚡ 继续保持！
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">学习进度</h2>
              <p className="text-sm text-gray-500">本周各项能力评分</p>
            </div>
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500">
              <option>本周</option>
              <option>本月</option>
              <option>全部</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorPronunciation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGrammar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="pronunciation" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPronunciation)" name="发音" />
                <Area type="monotone" dataKey="grammar" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGrammar)" name="语法" />
                <Area type="monotone" dataKey="vocabulary" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0.3} name="词汇" />
                <Area type="monotone" dataKey="fluency" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.3} name="流利度" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">发音</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">语法</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm text-gray-600">词汇</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-sm text-gray-600">流利度</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">每日一句</h2>
            <button
              onClick={speakSentence}
              className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-5 mb-4">
            <p className="text-lg font-medium text-gray-800 leading-relaxed mb-3">
              "{todaySentence.text}"
            </p>
            <p className="text-gray-600 text-sm">
              {todaySentence.translation}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className={`badge ${
              todaySentence.difficulty === 'easy' ? 'badge-success' :
              todaySentence.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
            }`}>
              {todaySentence.difficulty === 'easy' ? '简单' :
               todaySentence.difficulty === 'medium' ? '中等' : '困难'}
            </span>
            <Link
              to="/pronunciation"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              去练习 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">学习模块</h2>
          <p className="text-sm text-gray-500">选择一个模块开始学习</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {moduleCards.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.id}
                to={module.path}
                className="card card-hover group"
              >
                <div className={`w-14 h-14 ${module.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${module.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {module.description}
                </p>
                <span className="text-primary-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  开始学习 <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">推荐对话场景</h2>
          <Link
            to="/dialogue"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dialogueScenarios.map((scenario) => (
            <Link
              key={scenario.id}
              to={`/dialogue/${scenario.id}`}
              className="card card-hover text-center"
            >
              <div className="text-4xl mb-3">{scenario.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{scenario.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{scenario.description}</p>
              <span className={`badge ${
                scenario.difficulty === 'easy' ? 'badge-success' :
                scenario.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
              }`}>
                {scenario.difficulty === 'easy' ? '简单' :
                 scenario.difficulty === 'medium' ? '中等' : '困难'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
