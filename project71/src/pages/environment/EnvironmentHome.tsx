import React from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, PlayCircle, ChevronRight, Volume2, BookOpen, Star, TrendingUp, Clock } from 'lucide-react'
import { newsItems, videos, userProfile } from '../../data/mockData'

const modules = [
  {
    id: 'news',
    title: '每日新闻',
    description: '精听每日英语新闻，跟读练习地道表达',
    icon: Newspaper,
    path: '/environment/news',
    gradient: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 'videos',
    title: '原声视频',
    description: '基于词汇掌握量推荐适合难度的视频',
    icon: PlayCircle,
    path: '/environment/videos',
    gradient: 'from-pink-400 to-pink-600'
  }
]

export const EnvironmentHome: React.FC = () => {
  const todayNews = newsItems[0]
  const recommendedVideos = videos.filter(v => v.difficulty === userProfile.level).slice(0, 3)

  const levelNames: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">语言环境</h1>
          <p className="text-gray-500 mt-1">创造沉浸式学习环境，每天进步一点点</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">连续学习</p>
            <p className="text-2xl font-bold text-gray-800">14 天</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">当前水平</p>
            <p className="text-2xl font-bold text-gray-800">{levelNames[userProfile.level]}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Star className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">词汇量</p>
            <p className="text-2xl font-bold text-gray-800">{userProfile.vocabularyCount.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">本周学习</p>
            <p className="text-2xl font-bold text-gray-800">8.5 小时</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(module => {
          const Icon = module.icon
          return (
            <Link
              key={module.id}
              to={module.path}
              className="card card-hover group"
            >
              <div className="flex items-start gap-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{module.title}</h3>
                  <p className="text-gray-500 mb-4">{module.description}</p>
                  <span className="text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    开始学习 <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">📰 今日英语新闻</h2>
          <Link to="/environment/news" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            查看更多 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge bg-indigo-100 text-indigo-700">{todayNews.category}</span>
                <span className="text-sm text-gray-500">{todayNews.date}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{todayNews.title}</h3>
              <p className="text-gray-600 mb-4">{todayNews.summary}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Volume2 className="w-4 h-4" />
                  <span>时长 {todayNews.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BookOpen className="w-4 h-4" />
                  <span>难度 {levelNames[todayNews.difficulty]}</span>
                </div>
              </div>
            </div>
            <Link
              to="/environment/news"
              className="btn-primary flex-shrink-0"
            >
              开始精听
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">🎬 为你推荐的视频</h2>
          <Link to="/environment/videos" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            更多推荐 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedVideos.map(video => (
            <Link
              key={video.id}
              to="/environment/videos"
              className="group card-hover rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${
                    video.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    video.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {levelNames[video.difficulty]}
                  </span>
                  <span className="text-xs text-gray-400">{video.source}</span>
                </div>
                <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                  {video.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">{video.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="card bg-gradient-to-r from-primary-500 to-blue-600 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">💡 今日学习建议</h3>
            <p className="text-primary-100 max-w-2xl">
              根据你的学习进度，建议今天先花15分钟精听每日新闻，学习其中的重点词汇和表达。
              然后观看2个推荐视频进行泛听练习，最后做一篇跟读练习来巩固发音。
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
              <p className="text-3xl font-bold">45</p>
              <p className="text-sm text-primary-100">建议学习分钟</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
